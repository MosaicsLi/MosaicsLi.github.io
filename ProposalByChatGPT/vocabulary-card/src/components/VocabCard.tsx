import { useEffect, useState } from "react";
// VocabCard.tsx
import type { VocabItem } from "../types";

export default function VocabCard({ item, handleDelete }: {
    item: VocabItem;
    handleDelete: (id:number) => void;
    //onToggleLearned: (id: number) => void;
}) {
    const [open, setOpen] = useState(false);
    const learnedKey = `vocab_learned_${item.id}`;
    const [learned, setLearned] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem(learnedKey);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (saved === "true") setLearned(true);
    }, [learnedKey]);

    const toggleLearned = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // <-- 關鍵：阻止點擊事件向上傳播
        const newVal = !learned;
        setLearned(newVal);
        localStorage.setItem(learnedKey, String(newVal));
    };
    const deleteItem = () => {
        handleDelete(item.id);
    };

    return (
        <div onClick={() => setOpen(!open)} className="vocab-card" style={{
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 6,
            marginBottom: 10,
            background: learned ? "#e0ffe0" : "#fff", // 🔥 你甚至可以變色
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ cursor: "pointer" }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{item.word}</div>
                    {item.pronunciation && <div style={{ fontSize: 12, color: "#666" }}>{item.pronunciation}</div>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={toggleLearned} style={{ cursor: "pointer" }}>
                        {learned ? "已學習" : "標記學習"}
                    </button>
                    <button onClick={deleteItem} style={{
                        cursor: "pointer",
                        backgroundColor: "#f44336", // 讓刪除按鈕更明顯
                        color: "white",
                    }}>
                        刪除
                    </button>
                </div>
            </div>

            {open && (
                <div style={{ marginTop: 8, color: "#333" }}>
                    <div><strong>意思：</strong>{item.meaning}</div>
                    {item.example && <div style={{ marginTop: 6 }}><strong>例句：</strong>{item.example}</div>}
                    {item.tags && <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}><strong>標籤：</strong>{item.tags.join(", ")}</div>}
                </div>
            )}
        </div>
    );
}
