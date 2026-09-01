import { NextResponse } from "next/server";
import { resetState, getState } from "@/lib/store";

export async function POST() {
  resetState();
  return NextResponse.json(getState());
}
