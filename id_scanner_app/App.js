import React, { useState } from "react";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";

export default function App() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const departments = [
    "EDG","ETG","EA","AICOE","DSAG",
    "Data and AI Archi","IT Strategy and Governance"
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      setImage(reader.result);
      setLoading(true);

      try {
        const result = await Tesseract.recognize(reader.result, "eng");
        const extracted = result.data.text;

        const guess = extracted
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => /^[A-Z][A-Za-z '`.\-]{3,}$/.test(l))[0];

        if (guess) setName(guess);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const saveRecord = () => {
    if (!name || !department || !image) return;
    setRecords([...records, { name, department, image }]);
    setName(""); setDepartment(""); setImage(null);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      records.map(r => ({ Name: r.name, Department: r.department, ImageBase64: r.image }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registrations");
    XLSX.writeFile(wb, "registrations.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Christmas Party Registration</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {loading && <p>Extracting…</p>}
      {image && <img src={image} alt="" width={200} />}
      <br />
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" />
      <br />
      <select value={department} onChange={(e)=>setDepartment(e.target.value)}>
        <option value="">Select department</option>
        {departments.map(d => <option key={d}>{d}</option>)}
      </select>
      <br />
      <button onClick={saveRecord}>Save</button>
      <button onClick={exportToExcel}>Download Excel</button>
    </div>
  );
}
