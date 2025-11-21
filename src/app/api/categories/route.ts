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

export async function POST(request: Request) {
    try {
        const { cat_name } = await request.json();
        if (!cat_name) {
            return NextResponse.json({ success: false, message: "Category name is required" }, { status: 400 });
        }

        const result = await query("INSERT INTO categories (cat_name) VALUES (?)", [cat_name]);
        return NextResponse.json({ success: true, data: result });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}