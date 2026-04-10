const API_BASE = "/api";

const distros = [
  {
    name: "Arch Linux",
    apiName: "archlinux",
    version: "Packages & ISO",
    url: "/archlinux/",
    icon: "https://cdn.xeon.kr/LOGO/archlinux-512.png",
    lastSync: "3시간",
    proxy: false,
  },
  {
    name: "CachyOS",
    apiName: "cachyos",
    version: "Packages & ISO",
    url: "/cachyos",
    icon: "https://cdn.xeon.kr/LOGO/cachyos.svg",
    lastSync: "3시간",
    proxy: false,
  },
  {
    name: "PuTTY",
    apiName: "putty",
    version: "Packages",
    url: "/putty",
    icon: "https://cdn.xeon.kr/LOGO/putty.ico",
    lastSync: "3시간",
    proxy: false,
  },
  {
    name: "Tails",
    apiName: "tails",
    version: "Packages & ISO",
    url: "/tails",
    icon: "https://tails.net/lib/logo.svg",
    lastSync: "3시간",
    proxy: false,
  },
  {
    name: "Termux",
    apiName: "termux",
    version: "Packages",
    url: "/termux",
    icon: "https://cdn.xeon.kr/LOGO/termux.ico",
    lastSync: "3시간",
    proxy: false,
  },
];

let mirrorStatusMap = {};

function formatLastSync(lastSync) {
  if (!lastSync) return "-";
  const d = new Date(lastSync);
  if (isNaN(d.getTime())) return "-";
  const diffMs = new Date() - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}일 전`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getStatusBadge(status, enabled) {
  if (!enabled) return '<span class="sync-badge unknown">비활성</span>';
  switch ((status || "").toLowerCase()) {
    case "success":
      return '<span class="sync-badge success">동기화됨</span>';
    case "syncing":
      return '<span class="sync-badge syncing">동기화 중</span>';
    case "failed":
      return '<span class="sync-badge failed">실패</span>';
    default:
      return '<span class="sync-badge unknown">알 수 없음</span>';
  }
}

const distroList = document.getElementById("distro-list");

function renderDistros() {
  distroList.innerHTML = "";
  distros.forEach((distro) => {
    const status = mirrorStatusMap[distro.apiName];
    const isInactive = distro.inactive === true || (status && !status.enabled);
    const syncStatusText = distro.proxy
      ? `${distro.lastSync}에서 프록싱`
      : `동기화 주기: ${distro.lastSync}`;

    const badge = status ? getStatusBadge(status.status, status.enabled) : "";
    const sizeText = status && status.size_bytes > 0 ? status.size_human : "-";
    const lastSyncText =
      status && status.last_sync ? formatLastSync(status.last_sync) : "-";

    const buttonClass = isInactive
      ? "distro-btn inactive"
      : "distro-btn active";
    const buttonText = isInactive ? "비활성화됨" : "파일 보기";
    const buttonHref = isInactive ? "javascript:void(0)" : distro.url;

    const card = document.createElement("div");
    card.className = "distro-card";
    card.innerHTML = `
        <div class="distro-header">
            <img src="${distro.icon}" alt="${distro.name} 로고" onerror="this.style.display='none';">
            <div>
                <h3>${distro.name} ${badge}</h3>
                <p>${distro.version}</p>
            </div>
        </div>
        <div class="distro-info">
            ${syncStatusText}
            <div class="distro-detail">저장공간: ${sizeText} <br /> 마지막 동기화: ${lastSyncText}</div>
        </div>
        <a href="${buttonHref}" class="${buttonClass}">
            ${buttonText}
        </a>
    `;
    distroList.appendChild(card);
  });
}

async function fetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    mirrorStatusMap = {};
    (data.mirrors || []).forEach((m) => {
      mirrorStatusMap[m.name] = m;
    });
    renderDistros();
  } catch (e) {
    console.error("상태 불러오기 실패:", e);
  }
}

renderDistros();
fetchStatus();
setInterval(fetchStatus, 60000);
