export type ArrangeMode = "row" | "column" | "grid";
export type GridDirection = "western" | "japanese";

interface ImageEntry {
  id: number;
  img: HTMLImageElement;
  url: string;
  w: number;
  h: number;
}

interface Placement {
  entry: ImageEntry;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function initTatami() {
  let images: ImageEntry[] = [];
  let nextId = 1;
  let mode: ArrangeMode = "row";
  let gap = 0;
  let gridCols = 2;
  let direction: GridDirection = "western";
  let dragSrcIndex: number | null = null;
  let renderScheduled = false;

  const railList = document.getElementById("railList") as HTMLDivElement;
  const dropZone = document.getElementById("dropZone") as HTMLDivElement;
  const emptyState = document.getElementById("emptyState") as HTMLDivElement;
  const resultImg = document.getElementById("resultImg") as HTMLImageElement;
  const workCanvas = document.getElementById("workCanvas") as HTMLCanvasElement;
  const ctx = workCanvas.getContext("2d")!;
  const imgCount = document.getElementById("imgCount") as HTMLElement;
  const statCount = document.getElementById("statCount") as HTMLElement;
  const statDims = document.getElementById("statDims") as HTMLElement;
  const statSize = document.getElementById("statSize") as HTMLElement;
  const statTime = document.getElementById("statTime") as HTMLElement;
  const flashMsg = document.getElementById("flashMsg") as HTMLElement;
  const gapSlider = document.getElementById("gapSlider") as HTMLInputElement;
  const gapValue = document.getElementById("gapValue") as HTMLElement;
  const colsControl = document.getElementById("colsControl") as HTMLElement;
  const colsVal = document.getElementById("colsVal") as HTMLElement;
  const colsMinus = document.getElementById("colsMinus") as HTMLButtonElement;
  const colsPlus = document.getElementById("colsPlus") as HTMLButtonElement;
  const directionToggle = document.getElementById(
    "directionToggle",
  ) as HTMLElement;
  const segButtons = document.querySelectorAll<HTMLButtonElement>(".seg-btn");
  const dirButtons = document.querySelectorAll<HTMLButtonElement>(".dir-btn");

  function addImageFromBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const el = new Image();
    el.onload = function () {
      images.push({
        id: nextId++,
        img: el,
        url,
        w: el.naturalWidth,
        h: el.naturalHeight,
      });
      renderRail();
      scheduleRender();
    };
    el.src = url;
  }

  window.addEventListener("paste", function (e) {
    const items = (e.clipboardData && e.clipboardData.items) || [];
    let found = false;
    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          addImageFromBlob(blob);
          found = true;
        }
      }
    }
    if (found) e.preventDefault();
  });

  ["dragenter", "dragover"].forEach((evt) =>
    dropZone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropZone.classList.add("active");
    }),
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropZone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropZone.classList.remove("active");
    }),
  );
  dropZone.addEventListener("drop", function (e) {
    const files = (e.dataTransfer && e.dataTransfer.files) || [];
    for (const f of files) {
      if (f.type.startsWith("image/")) addImageFromBlob(f);
    }
  });

  interface RailRow {
    row: HTMLDivElement;
    idxEl: HTMLDivElement;
    rm: HTMLButtonElement;
  }

  const railRows = new Map<number, RailRow>();

  function indexOfId(id: number): number {
    return images.findIndex((e) => e.id === id);
  }

  function createRailRow(entry: ImageEntry): RailRow {
    const row = document.createElement("div");
    row.className = "thumb";
    row.draggable = true;

    const imageWrap = document.createElement("div");
    imageWrap.className = "thumb-image";

    const im = document.createElement("img");
    im.src = entry.img.src;
    imageWrap.appendChild(im);

    const rm = document.createElement("button");
    rm.className = "remove";
    rm.textContent = "×";
    rm.addEventListener("click", function (ev) {
      ev.stopPropagation();
      const i = indexOfId(entry.id);
      if (i === -1) return;
      URL.revokeObjectURL(images[i].url);
      images.splice(i, 1);
      renderRail();
      scheduleRender();
    });
    imageWrap.appendChild(rm);

    row.appendChild(imageWrap);

    const meta = document.createElement("div");
    meta.className = "meta";
    const idxEl = document.createElement("div");
    idxEl.className = "idx";
    const dims = document.createElement("div");
    dims.className = "dims";
    dims.textContent = entry.w + "×" + entry.h;
    meta.appendChild(idxEl);
    meta.appendChild(dims);
    row.appendChild(meta);

    row.addEventListener("dragstart", function () {
      dragSrcIndex = indexOfId(entry.id);
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", function () {
      row.classList.remove("dragging");
    });
    row.addEventListener("dragover", function (e) {
      e.preventDefault();
      row.classList.add("drop-target");
    });
    row.addEventListener("dragleave", function () {
      row.classList.remove("drop-target");
    });
    row.addEventListener("drop", function (e) {
      e.preventDefault();
      row.classList.remove("drop-target");
      const targetIndex = indexOfId(entry.id);
      if (dragSrcIndex === null || dragSrcIndex === targetIndex) return;
      const moved = images.splice(dragSrcIndex, 1)[0];
      images.splice(targetIndex, 0, moved);
      dragSrcIndex = null;
      renderRail();
      scheduleRender();
    });

    return { row, idxEl, rm };
  }

  function renderRail() {
    imgCount.textContent = String(images.length);

    const seen = new Set<number>();
    images.forEach((entry, i) => {
      seen.add(entry.id);
      let entryRow = railRows.get(entry.id);
      if (!entryRow) {
        entryRow = createRailRow(entry);
        railRows.set(entry.id, entryRow);
      }
      entryRow.row.dataset.index = String(i);
      entryRow.idxEl.textContent = "#" + (i + 1);
      entryRow.rm.setAttribute("aria-label", "Remove image " + (i + 1));
      railList.appendChild(entryRow.row);
    });

    for (const [id, entryRow] of railRows) {
      if (!seen.has(id)) {
        entryRow.row.remove();
        railRows.delete(id);
      }
    }
  }

  /* ---------- Mode / direction / gap controls ---------- */
  segButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      setMode(btn.dataset.mode as ArrangeMode);
    });
  });

  function setMode(m: ArrangeMode) {
    mode = m;
    segButtons.forEach((b) => b.classList.toggle("active", b.dataset.mode === m));
    const isGrid = m === "grid";
    colsControl.classList.toggle("disabled", !isGrid);
    directionToggle.classList.toggle("disabled", !isGrid);
    colsMinus.disabled = !isGrid;
    colsPlus.disabled = !isGrid;
    dirButtons.forEach((b) => (b.disabled = !isGrid));
    scheduleRender();
  }

  dirButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      direction = btn.dataset.dir as GridDirection;
      dirButtons.forEach((b) =>
        b.classList.toggle("active", b.dataset.dir === direction),
      );
      scheduleRender();
    });
  });

  colsMinus.addEventListener("click", function () {
    gridCols = Math.max(1, gridCols - 1);
    colsVal.textContent = String(gridCols);
    scheduleRender();
  });
  colsPlus.addEventListener("click", function () {
    gridCols = Math.min(8, gridCols + 1);
    colsVal.textContent = String(gridCols);
    scheduleRender();
  });

  gapSlider.addEventListener("input", function () {
    gap = parseInt(gapSlider.value, 10);
    gapValue.textContent = gap + "px";
    gapValue.classList.toggle("flush", gap === 0);
    scheduleRender();
  });

  /* ---------- Keyboard shortcuts ---------- */
  window.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target as HTMLElement | null)?.tagName || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "1") setMode("row");
    else if (e.key === "2") setMode("column");
    else if (e.key === "3") setMode("grid");
    else if (e.key.toLowerCase() === "c") copyResult();
  });

  /* ---------- Compositing ---------- */
  function scheduleRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(function () {
      renderScheduled = false;
      composite();
    });
  }

  function composite() {
    if (images.length === 0) {
      emptyState.style.display = "block";
      resultImg.style.display = "none";
      statDims.textContent = "— × —";
      statSize.textContent = "— KB";
      statTime.textContent = "—";
      statCount.textContent = "0";
      return;
    }

    const t0 = performance.now();
    let cw = 0,
      ch = 0;
    const placements: Placement[] = [];

    if (mode === "row") {
      const targetH = Math.min(...images.map((e) => e.h));
      let x = 0;
      images.forEach((entry) => {
        const scale = targetH / entry.h;
        const w = entry.w * scale;
        placements.push({ entry, x, y: 0, w, h: targetH });
        x += w + gap;
      });
      cw = x - gap;
      ch = targetH;
    } else if (mode === "column") {
      const targetW = Math.min(...images.map((e) => e.w));
      let y = 0;
      images.forEach((entry) => {
        const scale = targetW / entry.w;
        const h = entry.h * scale;
        placements.push({ entry, x: 0, y, w: targetW, h });
        y += h + gap;
      });
      cw = targetW;
      ch = y - gap;
    } else {
      const cols = gridCols;
      const rows = Math.ceil(images.length / cols);
      const cellW = Math.min(...images.map((e) => e.w));
      const cellH = Math.min(...images.map((e) => e.h));
      images.forEach((entry, i) => {
        let col: number, row: number;
        if (direction === "western") {
          row = Math.floor(i / cols);
          col = i % cols;
        } else {
          const colFromRight = Math.floor(i / rows);
          row = i % rows;
          col = cols - 1 - colFromRight;
        }
        const scale = Math.min(cellW / entry.w, cellH / entry.h);
        const w = entry.w * scale;
        const h = entry.h * scale;
        const cellX = col * (cellW + gap);
        const cellY = row * (cellH + gap);
        placements.push({
          entry,
          x: cellX + (cellW - w) / 2,
          y: cellY + (cellH - h) / 2,
          w,
          h,
        });
      });
      cw = cols * cellW + (cols - 1) * gap;
      ch = rows * cellH + (rows - 1) * gap;
    }

    workCanvas.width = Math.max(1, Math.round(cw));
    workCanvas.height = Math.max(1, Math.round(ch));
    ctx.clearRect(0, 0, workCanvas.width, workCanvas.height);
    placements.forEach((p) => {
      ctx.drawImage(p.entry.img, p.x, p.y, p.w, p.h);
    });

    const dataUrl = workCanvas.toDataURL("image/png");
    resultImg.src = dataUrl;
    resultImg.style.display = "block";
    emptyState.style.display = "none";

    const t1 = performance.now();
    const approxBytes = Math.round(
      (dataUrl.length - "data:image/png;base64,".length) * 0.75,
    );
    statDims.textContent = workCanvas.width + " × " + workCanvas.height;
    statSize.textContent = (approxBytes / 1024).toFixed(1) + " KB";
    statTime.textContent = (t1 - t0).toFixed(1);
    statCount.textContent = String(images.length);
  }

  /* ---------- Copy ---------- */
  function flash(text: string, ok: boolean) {
    flashMsg.textContent = text;
    flashMsg.className = "flash-msg " + (ok ? "ok" : "err");
    if (ok)
      setTimeout(() => {
        flashMsg.textContent = "";
      }, 1800);
  }

  async function copyResult() {
    if (images.length === 0) return;
    composite();
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        workCanvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("no blob");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flash("Copied ✓", true);
    } catch {
      flash("Clipboard blocked in preview — right-click the image instead", false);
    }
  }

  renderRail();
  composite();
}
