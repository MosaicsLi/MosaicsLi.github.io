// App.tsx
import { useCallback, useEffect, useState } from "react";
import VocabCard from "./components/VocabCard";
import type { VocabItem } from "./types";
import initialData from "./data/vocab_items.json";


function App() {
  const [items, setItems] = useState<VocabItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("vocab_items");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(parsed);
          return;
        }
      } catch (e) {
        console.log(e)
      }
    }

    // 如果 localStorage 空 → 初始化（只在首次）
    setItems(initialData);
  }, []);


  useEffect(() => {
    // 初始化階段 items = []，不要寫回
    //if (items.length === 0) return;

    localStorage.setItem("vocab_items", JSON.stringify(items));
  }, [items]);


  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const word = fd.get("word") as string;
    const meaning = fd.get("meaning") as string;
    if (!word || !meaning) return alert("請填寫字詞與意思");
    const newItem: VocabItem = {
      id: Date.now(),
      word,
      meaning,
      pronunciation: fd.get("pron") as string || undefined,
      example: fd.get("example") as string || undefined,
      tags: (fd.get("tags") as string || "").split(",").map(s => s.trim()).filter(Boolean)
    };
    setItems(prev => [newItem, ...prev]);
    form.reset();
  };
  const handleDelete = useCallback((idToDelete: number) => {
    console.log("要刪除的 ID (Type: " + typeof idToDelete + "): ", idToDelete);

    setItems(prevItems => {
      console.log("當前列表長度: ", prevItems.length);
      const newItems = prevItems.filter(item => {
        // 確認兩個 ID 的類型是否一致！
        console.log(`正在比較 ID: ${item.id} (Type: ${typeof item.id}) 與 ${idToDelete}`);
        return item.id !== idToDelete;
      });
      console.log("刪除後列表長度: ", newItems.length);
      return newItems;
    });
  }, []); // 依賴項為空，因為 setItems 是穩定函數

  return (
    <div style={{ maxWidth: 760, margin: "24px auto", fontFamily: "sans-serif" }}>
      <h1>Vocabulary — Exam Practice (First Draft)</h1>
      <button onClick={() => localStorage.clear()}>刪除localStorage</button>

      <section style={{ marginBottom: 20, padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
        <h2 style={{ marginTop: 0 }}>新增題目</h2>
        <form onSubmit={addItem}>
          <div style={{ display: "grid", gap: 8 }}>
            <input name="word" placeholder="Word" />
            <input name="pron" placeholder="Pronunciation (optional)" />
            <input name="meaning" placeholder="Meaning" />
            <input name="example" placeholder="Example (optional)" />
            <input name="tags" placeholder="tags, comma separated (optional)" />
            <button type="submit">新增</button>
          </div>
        </form>
      </section>

      <section>
        {items.map(item => (
          <VocabCard key={item.id} item={item} handleDelete={handleDelete} />
        ))}
      </section>
    </div>
  );
}

export default App;
