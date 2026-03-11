// //import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";


// import type { TextItem } from "pdfjs-dist/types/src/display/api";

// // pdfjsLib.GlobalWorkerOptions.workerSrc =
// //   require("pdfjs-dist/legacy/build/pdf.worker.js");

// export async function extractPdfText(file: File): Promise<string> {
//   try {
//     const arrayBuffer = await file.arrayBuffer();

//     const pdf = await pdfjsLib.getDocument({
//       data: arrayBuffer,
//     }).promise;

//     let text = "";

//     for (let i = 1; i <= pdf.numPages; i++) {
//       const page = await pdf.getPage(i);
//       const content = await page.getTextContent();

//       const strings = content.items.map((item: any) => item.str);
//       text += strings.join(" ") + "\n";
//     }
    

//     return text.trim();
//   } catch (error) {
//     console.error("PDF extraction error:", error);
//     return "";
//   }
// }




// lib/extractPdfText.ts

// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// export async function extractPdfText(file: File): Promise<string> {
//   try {
//     const arrayBuffer = await file.arrayBuffer();

//     const loadingTask = pdfjsLib.getDocument({
//       data: new Uint8Array(arrayBuffer),
//     });

//     const pdf = await loadingTask.promise;

//     let text = "";

//     for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//       const page = await pdf.getPage(pageNum);
//       const textContent = await page.getTextContent();

//       const pageText = textContent.items
//         .map((item) => {
//           if ("str" in item) {
//             return item.str;
//           }
//           return "";
//         })
//         .join(" ");

//       text += pageText + "\n";
//     }

//     return text.trim();
//   } catch (error) {
//     console.error("PDF extraction error:", error);
//     return "";
//   }
// }



import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      text += pageText + "\n";
    }

    return text.trim();
  } catch (err) {
    console.error("PDF parse error:", err);
    return "";
  }
}
