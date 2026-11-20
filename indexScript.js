let roomHolder = document.getElementById("roomList");

let addRoom = document.getElementById("addRoom");
let clearAllRooms = document.getElementById("clearAllRooms");
const darkModeToggle = document.getElementById("darkModeToggle");

const STORAGE_KEY = "wattwiseRoomsState";
const THEME_STORAGE_KEY = "wattwiseDarkMode";

const applianceData = [
    // Cooling
    // Cooling (Adjusted for real-world compressor/inverter duty cycles at ~₱15.55/kWh)
    { name: "Aircon", minPhp: 6.00, minWatt: 700, maxPhp: 13.70, maxWatt: 1600 },
    { name: "Fan", minPhp: 0.70, minWatt: 45, maxPhp: 1.24, maxWatt: 80 },
    { name: "Refrigerator", minPhp: 0.62, minWatt: 100, maxPhp: 1.56, maxWatt: 250 },
    { name: "Cooler", minPhp: 0.75, minWatt: 65, maxPhp: 1.75, maxWatt: 150 },
    // Cooking
    { name: "Rice Cooker", minPhp: 4.67, minWatt: 300, maxPhp: 10.89, maxWatt: 700 },
    { name: "Electric Kettle", minPhp: 23.33, minWatt: 1500, maxPhp: 31.1, maxWatt: 2000 },
    { name: "Microwave Oven", minPhp: 12.44, minWatt: 800, maxPhp: 18.66, maxWatt: 1200 },
    { name: "Electric Stove", minPhp: 18.66, minWatt: 1200, maxPhp: 32.66, maxWatt: 2100 },
    // Charger
    { name: "Laptop Charger", minPhp: 0.47, minWatt: 30, maxPhp: 1.01, maxWatt: 65 },
    { name: "Phone Charger", minPhp: 0.08, minWatt: 5, maxPhp: 0.47, maxWatt: 30 },
    // Laundry & Personal Care
    { name: "Iron", minPhp: 15.55, minWatt: 1000, maxPhp: 27.99, maxWatt: 1800 },
    { name: "Washing Machine", minPhp: 5.44, minWatt: 350, maxPhp: 7.78, maxWatt: 500 },
    { name: "Hair Dryer", minPhp: 18.66, minWatt: 1200, maxPhp: 27.99, maxWatt: 1800 },
    { name: "Shower Heater", minPhp: 46.65, minWatt: 3000, maxPhp: 124.41, maxWatt: 8000 },
    // Entertainment
    { name: "TV", minPhp: 0.47, minWatt: 30, maxPhp: 1.56, maxWatt: 100 },
    { name: "PC", minPhp: 1.56, minWatt: 100, maxPhp: 4.67, maxWatt: 300 },
    { name: "Wifi", minPhp: 0.08, minWatt: 5, maxPhp: 0.23, maxWatt: 15 },
    // Common
    { name: "Lightbulbs", minPhp: 0.14, minWatt: 9, maxPhp: 0.23, maxWatt: 15 }
];

function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    if (darkModeToggle) {
        darkModeToggle.checked = isDark;
    }
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "1" : "0");
    if (typeof updateEstimate === "function") {
        updateEstimate();
    }
}

if (darkModeToggle) {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) === "1";
    document.body.classList.toggle("dark-mode", savedTheme);
    darkModeToggle.checked = savedTheme;

    darkModeToggle.onchange = function() {
        applyTheme(darkModeToggle.checked);
    };
}

function saveRoomsState() {
    const state = [];
    const allRooms = roomHolder.querySelectorAll(".roomStyle");

    allRooms.forEach((room, index) => {
        const titleEl = room.querySelector("h3");
        const roomName = (titleEl ? titleEl.textContent.trim() : "") || `Room ${index + 1}`;
        const appliances = [];

        room.querySelectorAll(".applianceItem").forEach(item => {
            const select = item.querySelector(".applianceSelect");
            const inputs = item.querySelectorAll(".timeInput");
            appliances.push({
                applianceIndex: select ? select.value : "",
                hours: inputs[0] ? inputs[0].value : 1,
                mins: inputs[1] ? inputs[1].value : 0
            });
        });

        state.push({
            name: roomName,
            appliances
        });
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createApplianceRow(initialData = null) {
    const applianceDiv = document.createElement("div");
    applianceDiv.classList.add("applianceItem");

    // 1. Create the dropdown list
    const select = document.createElement("select");
    select.classList.add("applianceSelect");

    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Choose an appliance...";
    defaultOption.value = "";
    select.append(defaultOption);

    applianceData.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = item.name;
        select.append(option);
    });

    // 2. Show wattage
    const valueDisplay = document.createElement("span");
    valueDisplay.textContent = "0 W";

    function syncWattageDisplay() {
        if (select.value === "" || !applianceData[select.value]) {
            valueDisplay.textContent = "0 W";
        } else {
            const chosen = applianceData[select.value];
            valueDisplay.textContent = `${chosen.minWatt}W - ${chosen.maxWatt}W`;
        }
    }

    select.onchange = function() {
        syncWattageDisplay();
        updateEstimate();
    };

    // 3. Create Hours & Minutes inputs
    const timeContainer = document.createElement("div");
    timeContainer.classList.add("timeContainer");

    const hoursInput = document.createElement("input");
    hoursInput.type = "number";
    hoursInput.classList.add("timeInput");
    hoursInput.value = 1;
    hoursInput.min = 0;
    hoursInput.max = 24;
    hoursInput.placeholder = "hr";

    const colon = document.createElement("span");
    colon.textContent = " : ";

    const minsInput = document.createElement("input");
    minsInput.type = "number";
    minsInput.classList.add("timeInput");
    minsInput.value = 0;
    minsInput.min = 0;
    minsInput.max = 59;
    minsInput.placeholder = "min";

    const timeLabel = document.createElement("span");
    timeLabel.textContent = " /day";

    hoursInput.oninput = updateEstimate;
    minsInput.oninput = updateEstimate;

    timeContainer.append(hoursInput, colon, minsInput, timeLabel);

    // 4. Remove button
    const removeAppBtn = document.createElement("button");
    removeAppBtn.classList.add("removeButton");
    removeAppBtn.textContent = "-";
    removeAppBtn.onclick = function() {
        applianceDiv.remove();
        updateEstimate();
    };

    if (initialData) {
        if (initialData.applianceIndex !== undefined && initialData.applianceIndex !== "") {
            select.value = String(initialData.applianceIndex);
            syncWattageDisplay();
        }
        if (initialData.hours !== undefined) hoursInput.value = initialData.hours;
        if (initialData.mins !== undefined) minsInput.value = initialData.mins;
    }

    applianceDiv.append(select, valueDisplay, timeContainer, removeAppBtn);
    return applianceDiv;
}

function createRoomCard(initialRoom = null) {
    const newRoomDiv = document.createElement("div");
    newRoomDiv.classList.add("roomStyle");

    const roomTitle = document.createElement("h3");
    roomTitle.textContent = (initialRoom && initialRoom.name) ? initialRoom.name : "Room";

    const addApplianceBtn = document.createElement("button");
    addApplianceBtn.classList.add("addApplianceButton");
    addApplianceBtn.textContent = "+";

    // Create the container at the bottom of the room
    const applianceList = document.createElement("div");
    applianceList.classList.add("applianceList");

    // Click event to add a new appliance row with dropdown + time inputs
    addApplianceBtn.onclick = function() {
        applianceList.append(createApplianceRow());
        updateEstimate();
    };

    /* Edit name */
    const editBtn = document.createElement("button");
    editBtn.classList.add("editButton");
    editBtn.textContent = "✎";

    editBtn.onclick = function() {
        if (!roomTitle.isContentEditable) {
            roomTitle.contentEditable = "true";
            roomTitle.focus();
            editBtn.textContent = "✓";
        } else {
            roomTitle.contentEditable = "false";
            editBtn.textContent = "✎";
            if (roomTitle.textContent.trim() === "") {
                roomTitle.textContent = "Room";
            }
            updateEstimate(); // Updates room name in #results and saves state
        }
    };

    roomTitle.oninput = saveRoomsState;

    roomTitle.onkeydown = function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            editBtn.click();
        }
    };

    /* Remove card */
    const newButtonContainer = document.createElement("div");
    newButtonContainer.classList.add("buttonContainer");
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("removeButton");
    removeBtn.textContent = "-";

    removeBtn.onclick = function() {
        newRoomDiv.remove();
        updateEstimate();
    };

    newButtonContainer.append(addApplianceBtn, editBtn, removeBtn);
    newRoomDiv.append(roomTitle, newButtonContainer, applianceList);

    if (initialRoom && Array.isArray(initialRoom.appliances)) {
        initialRoom.appliances.forEach(appData => {
            applianceList.append(createApplianceRow(appData));
        });
    }

    roomHolder.append(newRoomDiv);
}

function loadRoomsState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        const savedRooms = JSON.parse(raw);
        if (Array.isArray(savedRooms)) {
            savedRooms.forEach(roomData => createRoomCard(roomData));
        }
    } catch (err) {
        console.warn("Could not restore saved rooms:", err);
    }
}

if (clearAllRooms) {
    clearAllRooms.onclick = function() {
        if (roomHolder.children.length === 0) return;
        roomHolder.innerHTML = "";
        updateEstimate();
    };
}

addRoom.onclick = function() {
    createRoomCard();
    updateEstimate();
};

const resultsDiv = document.getElementById("results");
let consumptionChart = null;

// Base color per room (cycled if you add more rooms)
const roomBaseColors = [
    "#E9AC3B", // Gold
    "#4CAF50", // Green
    "#42A5F5", // Blue
    "#FF7043", // Coral
    "#AB47BC", // Purple
    "#26A69A", // Teal
    "#EC407A", // Pink
    "#FFA726"  // Orange
];

// Converts a hex color + lightness shift (-0.35 to +0.35) into a shade variation
function shadeHexColor(hex, percent) {
    const cleanHex = hex.replace("#", "");
    const num = parseInt(cleanHex, 16);

    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    const adjust = (channel) => {
        if (percent >= 0) {
            return Math.min(255, Math.round(channel + (255 - channel) * percent));
        } else {
            return Math.max(0, Math.round(channel * (1 + percent)));
        }
    };

    r = adjust(r);
    g = adjust(g);
    b = adjust(b);

    return `rgb(${r}, ${g}, ${b})`;
}

// Generates distinct variations of a room's base color for each appliance in that room
function getApplianceShades(baseHex, count) {
    if (count <= 1) return [baseHex];

    const minShift = -0.28;
    const maxShift = 0.32;
    const shades = [];

    for (let i = 0; i < count; i++) {
        const ratio = i / (count - 1);
        const shift = minShift + ratio * (maxShift - minShift);
        shades.push(shadeHexColor(baseHex, shift));
    }

    return shades;
}

function updateEstimate() {
    saveRoomsState();

    let minTotal = 0;
    let maxTotal = 0;

    // Slice arrays for the pie chart (each entry = 1 appliance in 1 room)
    const sliceLabels = [];
    const sliceValues = [];
    const sliceRanges = [];
    const sliceColors = [];

    // Grouped per room for the multi-column legend
    const roomLegendGroups = [];

    // Clear #results first
    resultsDiv.innerHTML = "";

    // 1. Create the top Estimate header
    const estimateHeader = document.createElement("div");
    estimateHeader.classList.add("estimateHeader");

    // 2. Pie chart container (placed right after estimateHeader)
    const chartWrapper = document.createElement("div");
    chartWrapper.classList.add("chartWrapper");

    const chartBox = document.createElement("div");
    chartBox.classList.add("chartBox");

    const canvas = document.createElement("canvas");
    chartBox.append(canvas);
    chartWrapper.append(chartBox);

    const customLegend = document.createElement("div");
    customLegend.classList.add("customLegend");

    // 3. Container for the room-by-room breakdown
    const breakdownContainer = document.createElement("div");
    breakdownContainer.classList.add("breakdownContainer");

    // Loop through each room card
    const allRooms = document.querySelectorAll(".roomStyle");

    allRooms.forEach((room, roomIndex) => {
        const roomName = room.querySelector("h3").textContent.trim() || `Room ${roomIndex + 1}`;
        const appliances = room.querySelectorAll(".applianceItem");
        const baseColor = roomBaseColors[roomIndex % roomBaseColors.length];

        // Create a card for this room in #results
        const roomResultCard = document.createElement("div");
        roomResultCard.classList.add("roomResultCard");

        const roomResultTitle = document.createElement("h4");
        roomResultTitle.textContent = roomName;
        roomResultCard.append(roomResultTitle);

        let hasSelectedAppliance = false;
        const activeRoomAppliances = [];

        appliances.forEach(item => {
            const select = item.querySelector(".applianceSelect");
            const inputs = item.querySelectorAll(".timeInput");

            const hours = Math.max(0, Math.min(24, parseFloat(inputs[0].value) || 0));
            const mins = Math.max(0, Math.min(59, parseFloat(inputs[1].value) || 0));
            const totalHoursPerDay = hours + (mins / 60);

            if (select.value !== "" && applianceData[select.value]) {
                hasSelectedAppliance = true;
                const appliance = applianceData[select.value];

                const appMinMonthly = appliance.minPhp * totalHoursPerDay * 30;
                const appMaxMonthly = appliance.maxPhp * totalHoursPerDay * 30;
                const appAvgMonthly = (appMinMonthly + appMaxMonthly) / 2;

                minTotal += appMinMonthly;
                maxTotal += appMaxMonthly;

                // Create row for this appliance's monthly cost
                const appRow = document.createElement("div");
                appRow.classList.add("appResultRow");
                appRow.innerHTML = `
                    <span>${appliance.name}</span>
                    <span>₱${appMinMonthly.toFixed(2)} - ₱${appMaxMonthly.toFixed(2)}</span>
                `;
                roomResultCard.append(appRow);

                if (appAvgMonthly > 0) {
                    activeRoomAppliances.push({
                        name: appliance.name,
                        label: `${roomName} — ${appliance.name}`,
                        avg: appAvgMonthly,
                        rangeText: `₱${appMinMonthly.toFixed(2)} - ₱${appMaxMonthly.toFixed(2)}`
                    });
                }
            }
        });

        // Only show the room in #results if it has at least one chosen appliance
        if (hasSelectedAppliance) {
            breakdownContainer.append(roomResultCard);
        }

        // Assign color variations for appliances in this room
        if (activeRoomAppliances.length > 0) {
            const shades = getApplianceShades(baseColor, activeRoomAppliances.length);
            const legendItems = [];

            activeRoomAppliances.forEach((appEntry, idx) => {
                const shade = shades[idx];
                sliceLabels.push(appEntry.label);
                sliceValues.push(appEntry.avg);
                sliceRanges.push(appEntry.rangeText);
                sliceColors.push(shade);

                legendItems.push({
                    name: appEntry.name,
                    avg: appEntry.avg,
                    color: shade
                });
            });

            roomLegendGroups.push({
                roomName,
                baseColor,
                items: legendItems
            });
        }
    });

    // Set the centered Estimate text at the top
    estimateHeader.textContent = `Estimate: ₱${minTotal.toFixed(2)} - ₱${maxTotal.toFixed(2)}`;
    resultsDiv.append(estimateHeader);

    if (sliceValues.length > 0) {
        chartWrapper.append(customLegend);
        resultsDiv.append(chartWrapper);

        if (consumptionChart) {
            consumptionChart.destroy();
        }

        const grandTotalAvg = sliceValues.reduce((sum, val) => sum + val, 0);
        const isDarkMode = document.body.classList.contains("dark-mode");
        const sliceBorderColor = isDarkMode ? "#2d3340" : "#808080";

        consumptionChart = new Chart(canvas, {
            type: "pie",
            data: {
                labels: sliceLabels,
                datasets: [{
                    data: sliceValues,
                    backgroundColor: sliceColors,
                    borderColor: sliceBorderColor,
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                const pct = ((sliceValues[idx] / grandTotalAvg) * 100).toFixed(1);
                                return ` ${sliceLabels[idx]}: ${sliceRanges[idx]} (${pct}% of total)`;
                            }
                        }
                    }
                }
            }
        });

        // Build one column per room
        roomLegendGroups.forEach(group => {
            const col = document.createElement("div");
            col.classList.add("legendColumn");

            const roomHeader = document.createElement("div");
            roomHeader.classList.add("legendRoomHeader");

            const roomSwatch = document.createElement("span");
            roomSwatch.classList.add("legendSwatch");
            roomSwatch.style.backgroundColor = group.baseColor;

            const roomLabel = document.createElement("span");
            roomLabel.textContent = group.roomName;

            roomHeader.append(roomSwatch, roomLabel);
            col.append(roomHeader);

            group.items.forEach(item => {
                const row = document.createElement("div");
                row.classList.add("legendApplianceItem");

                const appSwatch = document.createElement("span");
                appSwatch.classList.add("legendSwatch");
                appSwatch.style.backgroundColor = item.color;

                const pct = ((item.avg / grandTotalAvg) * 100).toFixed(1);
                const appText = document.createElement("span");
                appText.textContent = `${item.name} (${pct}%)`;

                row.append(appSwatch, appText);
                col.append(row);
            });

            customLegend.append(col);
        });
    }

    resultsDiv.append(breakdownContainer);
}

loadRoomsState();
updateEstimate();