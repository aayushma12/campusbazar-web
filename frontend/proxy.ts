import { NextResponse } from "next/server";

export function proxy(request: Request) {
    return NextResponse.next();
}
