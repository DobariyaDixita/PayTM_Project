import { currentUser } from "@clerk/nextjs/server";

import prisma from "@repo/db/client";
import CardInfo from "../../../components/CardInfo";
import { getAllBudget } from "../../lib/actions/budget";
import { BudgetItem } from "../../../components/BudgetItem";
import BarGraph from "../../../components/BarGraph";
import Link from "next/link";


export default async function Page() {
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const data = await getAllBudget(userEmail!);

  const budgetListWithExpenses = await prisma.budget.findMany({
    where: {
      createdBy: userEmail,
    },
    include: {
      expenses: true,
    },
  });

  const budgetData = budgetListWithExpenses.map((budget) => {
    const expenseAmount = budget.expenses.reduce(
      (sum, expense) => sum + expense.expenseAmount,
      0
    );
    return {
      budgetName: budget.name,
      budgetAmount: budget.amount,
      expenseAmount: expenseAmount,
    };
  });

  const totalBudgetAmount = await prisma.budget.aggregate({
    where: {
      createdBy: userEmail,
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  const expenses = await prisma.budget.findMany({
    where: {
      createdBy: userEmail,
    },
    include: {
      expenses: {
        select: {
          expenseAmount: true,
        },
      },
    },
  });

  const expensesInfo = expenses.flatMap((e) => e.expenses);
  const expenseAmount = expensesInfo.reduce((prev, curr) => {
    return prev + curr.expenseAmount;
  }, 0);

  return (
    <div className="p-8">
      <div className="text-2xl font-bold">Hi , {user?.fullName}</div>
      <div className="text-base text-gray-700 opacity-70">
        Manage your expenses from dashboard
      </div>
      <div className="mt-5">
        <CardInfo
          totalBudget={totalBudgetAmount._sum.amount}
          totalExpense={expenseAmount}
          noOfBudgets={totalBudgetAmount._count.id}
        />
      </div>
      <div className="mt-10 grid md:grid-cols-12">
        <div className="col-span-8">
          {budgetData && <BarGraph budgetData={budgetData} />}
        </div>
        <div className="px-5 col-span-4">
          <h2 className="font-bold text-xl">Latest Budgets</h2>
          <div className="grid gap-2 mt-2">
            {data.map((budget) => {
              return (
                <Link href={`/expense/${budget.id}`} key={budget.id}>
                  <BudgetItem budget={budget} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
