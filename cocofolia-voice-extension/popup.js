document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["proxyIP"], (data) => {
    if (data.proxyIP) document.getElementById("proxyIP").value = data.proxyIP;
  });
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const proxyIP = document.getElementById("proxyIP").value;
  chrome.storage.sync.set({ proxyIP }, () => {
    alert("保存しました！");
  });
});
