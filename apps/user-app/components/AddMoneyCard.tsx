"use client";

import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textinput";
import { Select } from "@repo/ui/select";
import { Button } from "@repo/ui/button";
import { useState } from "react";
import { createOnRampTransaction } from "../app/lib/actions/createOnrampTransaction";

const SUPPORTED_BANKS = [
  {
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com",
  },
  {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/",
  },
];

export const AddMoney = () => {
  const [redirectUrl, setRedirectUrl] = useState(
    SUPPORTED_BANKS[0]?.redirectUrl
  );

  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
  const [value, setValue] = useState(0);

  return (
    <Card title="Add Money">
      <div className="mt-3">
        <TextInput
          label="Amount"
          placeholder="Amount"
          onChange={(val) => {
            setValue(Number(val));
          }}
        />
      </div>
      <div className="py-4 text-left">Bank</div>
      <div>
        <Select
          onSelect={(value) => {
            setRedirectUrl(
              SUPPORTED_BANKS.find((x) => x.name === value)?.redirectUrl || ""
            );
            setProvider(
              SUPPORTED_BANKS.find((x) => x.name === value)?.name || ""
            );
          }}
          options={SUPPORTED_BANKS.map((x) => ({
            key: x.name,
            value: x.name,
          }))}
        />
      </div>

      <div className="pt-4 flex justify-center">
        <Button
          onClick={async () => {
            await createOnRampTransaction(provider, value);
            window.location.href = redirectUrl || "";
          }}
        >
          Add Money
        </Button>
      </div>
    </Card>
  );
};
