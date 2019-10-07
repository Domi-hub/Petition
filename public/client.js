(() => {
    const signatureCanvas = document.getElementById("signature");
    const c = signatureCanvas.getContext("2d");
    const clientRect = signatureCanvas.getBoundingClientRect();
    let isSigning = false;
    let x;
    let y;

    function sign(c, xAxis, yAxis, x, y) {
        c.lineWidth = 4;
        c.strokeStyle = "blue";
        c.beginPath();
        c.moveTo(xAxis, yAxis);
        c.lineTo(x, y);
        c.stroke();
    }

    signatureCanvas.addEventListener("mousedown", e => {
        x = e.clientX - clientRect.left;
        y = e.clientY - clientRect.top;
        isSigning = true;
    });

    signatureCanvas.addEventListener("mousemove", e => {
        if (isSigning == true) {
            sign(
                c,
                x,
                y,
                e.clientX - clientRect.left,
                e.clientY - clientRect.top
            );
            x = e.clientX - clientRect.left;
            y = e.clientY - clientRect.top;
        }
    });

    signatureCanvas.addEventListener("mouseup", () => {
        isSigning = false;
        document.getElementById("data").value = signatureCanvas.toDataURL();
    });
})();
