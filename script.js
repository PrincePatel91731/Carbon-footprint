let chart;
let latestData = {};

function calculateFootprint() {
    const electricity = parseFloat(document.getElementById("electricity").value) || 0;
    const vehicle = parseFloat(document.getElementById("vehicle").value) || 0;
    const flight = parseFloat(document.getElementById("flight").value) || 0;

    const electricityEmission = electricity * 0.85;
    const vehicleEmission = vehicle * 0.21;
    const flightEmission = flight * 0.15;

    const total = electricityEmission + vehicleEmission + flightEmission;

    latestData = {
        electricity,
        vehicle,
        flight,
        total
    };

    document.getElementById("totalEmission").innerText =
        total.toFixed(2) + " kg CO₂";

    let ecoScore = Math.max(0, 100 - (total / 100));
    document.getElementById("ecoScore").innerText =
        ecoScore.toFixed(0) + "/100";

    let level = "Low";
    if (total > 1000) level = "High";
    else if (total > 500) level = "Medium";

    document.getElementById("carbonLevel").innerText = level;

    generateTips(total);
    saveHistory(total);
    renderChart(electricityEmission, vehicleEmission, flightEmission);
}

function generateTips(total) {
    const tipsList = document.getElementById("tipsList");
    tipsList.innerHTML = "";

    let tips = [];

    if (total > 1000) {
        tips = [
            "Reduce flight travel.",
            "Use electric vehicles.",
            "Install solar panels."
        ];
    } else if (total > 500) {
        tips = [
            "Use energy-efficient appliances.",
            "Carpool more often."
        ];
    } else {
        tips = [
            "Excellent! Keep maintaining sustainable habits."
        ];
    }

    tips.forEach(tip => {
        let li = document.createElement("li");
        li.innerText = tip;
        tipsList.appendChild(li);
    });
}

function saveHistory(total) {
    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.push(total.toFixed(2));
    localStorage.setItem("history", JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("history")) || [];

    history.forEach((item, index) => {
        let li = document.createElement("li");
        li.innerText = `Record ${index + 1}: ${item} kg CO₂`;
        historyList.appendChild(li);
    });
}

function renderChart(electricity, vehicle, flight) {
    const ctx = document.getElementById("footprintChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Electricity", "Vehicle", "Flight"],
            datasets: [{
                data: [electricity, vehicle, flight]
            }]
        }
    });
}

function downloadPDF() {
    if (!latestData || !latestData.total) {
        alert("Please calculate your carbon footprint first!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const date = new Date().toLocaleDateString();

    // Eco score
    let ecoScore = Math.max(0, 100 - (latestData.total / 100));

    // Carbon level
    let level = "Low";
    if (latestData.total > 1000) {
        level = "High";
    } else if (latestData.total > 500) {
        level = "Medium";
    }

    // Suggestions
    let tips = [];
    if (latestData.total > 1000) {
        tips = [
            "Reduce air travel",
            "Use renewable energy",
            "Switch to electric transport"
        ];
    } else if (latestData.total > 500) {
        tips = [
            "Use public transport",
            "Reduce electricity waste"
        ];
    } else {
        tips = [
            "Maintain your eco-friendly lifestyle"
        ];
    }

    // PAGE 1
    doc.setFontSize(22);
    doc.text("Carbon Footprint Report", 55, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 35);

    doc.line(20, 40, 190, 40);

    doc.setFontSize(16);
    doc.text("Activity Summary", 20, 55);

    doc.setFontSize(12);
    doc.text(`Electricity Usage: ${latestData.electricity} kWh/month`, 25, 70);
    doc.text(`Vehicle Travel: ${latestData.vehicle} km/month`, 25, 80);
    doc.text(`Flight Travel: ${latestData.flight} km/year`, 25, 90);

    doc.setFontSize(16);
    doc.text("Emission Analysis", 20, 110);

    doc.setFontSize(12);
    doc.text(`Total Emission: ${latestData.total.toFixed(2)} kg CO2`, 25, 125);
    doc.text(`Eco Score: ${ecoScore.toFixed(0)}/100`, 25, 135);
    doc.text(`Carbon Level: ${level}`, 25, 145);

    doc.setFontSize(16);
    doc.text("Suggestions", 20, 165);

    let y = 180;
    tips.forEach((tip) => {
        doc.text(`- ${tip}`, 25, y);
        y += 10;
    });

    // PAGE 2 (Chart)
    const canvas = document.getElementById("footprintChart");

    if (canvas) {
        const chartImage = canvas.toDataURL("image/png");

        doc.addPage();
        doc.setFontSize(20);
        doc.text("Carbon Footprint Chart", 50, 20);

        doc.addImage(chartImage, "PNG", 30, 40, 150, 150);

        doc.setFontSize(12);
        doc.text(
            "Save Earth, Reduce Carbon, Build a Better Future",
            35,
            210
        );
    }

    // Final save
    doc.save("Carbon_Footprint_Report.pdf");
}
function resetData() {
    document.getElementById("electricity").value = "";
    document.getElementById("vehicle").value = "";
    document.getElementById("flight").value = "";

    document.getElementById("totalEmission").innerText = "0 kg CO₂";
    document.getElementById("ecoScore").innerText = "0/100";
    document.getElementById("carbonLevel").innerText = "Low";

    document.getElementById("tipsList").innerHTML = "";
}

window.onload = displayHistory;