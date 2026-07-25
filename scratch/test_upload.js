import fs from "fs";
import path from "path";

async function testUpload() {
  const dummyBuffer = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"); // 1px GIF
  const blob = new Blob([dummyBuffer], { type: "image/gif" });

  const formData = new FormData();
  formData.append("image", blob, "test_cake.gif");

  const res = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("UPLOAD API RESULT:", data);
}

testUpload();
