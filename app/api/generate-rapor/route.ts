import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak ditemukan" }, { status: 500 });
    }

    // Inisialisasi client menggunakan SDK terbaru
    const ai = new GoogleGenAI({ apiKey });

    const { studentName, observations } = await req.json();
    const notes = observations.map((o: any) => `- ${o.aspect}: ${o.note}`).join("\n");

    const prompt = `Anda adalah Guru PAUD. Tolong buatkan narasi rapor untuk murid bernama ${studentName}.
      Gunakan data observasi berikut:
      ${notes}
      
      Buatkan kesimpulan tentang murid ${studentName} sesuai dengan semua observasi ${notes}.
      Buatlah dalam Bahasa Indonesia yang sangat sopan, hangat, dan profesional khas Guru PAUD. 
      Sertakan saran untuk orang tua di bagian akhir.`;

    // Menggunakan model terbaru sesuai panduan: gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return NextResponse.json({ summary: response.text });
  } catch (error: any) {
    console.error("AI ERROR:", error);
    return NextResponse.json(
      { error: "Gagal memanggil Gemini 2.5: " + error.message },
      { status: 500 }
    );
  }
}   