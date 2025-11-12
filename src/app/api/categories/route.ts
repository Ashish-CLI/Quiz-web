import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const categories = await query("SELECT cat_id, cat_name FROM categories");
        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}