/**
 * Electricity Data Visualizations
 * Standalone version for static HTML pages
 *
 * Dependencies (loaded via CDN in HTML):
 * - D3.js v7
 * - Observable Plot
 * - SunCalc
 * - simple-statistics
 */

// Configuration
const CONFIG = {
    lat: 56.16,
    long: 10.20,
    dataPath: '../media/data/'
};

// =============================================================================
// DATA LOADING
// =============================================================================

async function loadCSV(filename) {
    const response = await fetch(CONFIG.dataPath + filename);
    const text = await response.text();

    return d3.csvParse(text, d3.autoType);
}

function parseDate(dateStr) {
    const parts = dateStr.replace(" 00:00:00", "").split("-");
    return new Date(parts[2], parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function parseValue(val) {
    return typeof val === "string" ? parseInt(val) : val;
}

// =============================================================================
// DATA TRANSFORMATIONS
// =============================================================================


async function loadMonthlyData() {
    const raw = await loadCSV('el-consumption-months-all.csv');

    return raw
        .filter(o => {
            const year = o["Fra_dato"].substring(6, 10);
            return o["Type"] === "Tidsserie" && year !== "2017";
        })
        .map(o => {
            const d = parseDate(o["Fra_dato"]);
            const v = parseValue(o["Mngde"]);
            return {
                date: d,
                kwhs: v,
                year: d.getFullYear(),
                month: d.getMonth(),
                fakedate: new Date(2022, d.getMonth())
            };
        })
        .sort((a, b) => a.date - b.date);
}

async function loadDailyData() {
    const raw = await loadCSV('el-consumption-days-all.csv');

    return raw
        .filter(o => {
            const year = o["Fra_dato"].substring(6, 10);
            return o["Type"] === "Tidsserie" && year !== "2017";
        })
        .map(o => {
            const d = parseDate(o["Fra_dato"]);
            const v = parseValue(o["Mngde"]);
            return {
                date: d,
                kwhs: v,
                year: d.getFullYear(),
                month: d.getMonth()
            };
        })
        .sort((a, b) => a.date - b.date);
}

async function loadDailyDataWithDaylight() {
    const raw = await loadCSV('el-consumption-days-all.csv');

    return raw
        .filter(o => {
            const year = o["Fra_dato"].substring(6, 10);
            return o["Type"] === "Tidsserie" && year !== "2017";
        })
        .map(o => {
            const d = parseDate(o["Fra_dato"]);
            const sun = SunCalc.getTimes(d, CONFIG.lat, CONFIG.long);
            const daylight = (sun.sunset - sun.sunrise) / 1000 / 60;
            const v = parseValue(o["Mngde"]);
            return { date: d, kwhs: v, daylight: daylight };
        })
        .sort((a, b) => a.date - b.date);
}

async function loadRadialData() {
    const raw = await loadCSV('el-consumption-days-all.csv');

    const filtered = raw.filter(o => {
        const year = o["Fra_dato"].substring(6, 10);
        return o["Type"] === "Tidsserie" && year !== "2017";
    });

    const days = {};

    filtered.forEach(o => {
        const dstr = o["Fra_dato"].replace(" 00:00:00", "").split("-");

        // Skip leap year day
        if (dstr[1] === "02" && dstr[0] === "29") return;

        const date = new Date(`2022-${dstr[1]}-${dstr[0]}`);
        const dateKey = date.toISOString();

        if (!days[dateKey]) {
            const sun = SunCalc.getTimes(date, CONFIG.lat, CONFIG.long);
            const day_hs = sun.sunset.getHours() - sun.sunrise.getHours();
            days[dateKey] = {
                date: date,
                kwhs_min: 100,
                kwhs_max: 0,
                kwhs_values: [],
                kwhs_median: 0,
                kwhs_q_lower: 0,
                kwhs_q_upper: 0,
                day_hs: day_hs
            };
        }

        const v = parseValue(o["Mngde"]);
        days[dateKey].kwhs_values.push(v);
        days[dateKey].kwhs_min = Math.min(v, days[dateKey].kwhs_min);
        days[dateKey].kwhs_max = Math.max(v, days[dateKey].kwhs_max);
    });

    return Object.values(days)
        .sort((a, b) => a.date - b.date)
        .map(o => {
            o.kwhs_median = d3.median(o.kwhs_values);
            o.kwhs_q_lower = d3.quantile(o.kwhs_values, 0.25);
            o.kwhs_q_upper = d3.quantile(o.kwhs_values, 0.75);
            return o;
        });
}

// =============================================================================
// VISUALIZATIONS
// =============================================================================

function plotMonthlyConsumption(container, months) {

    const plot = Plot.plot({
        width: 800,
        height: 350,
        marginLeft: 50,

        x: {
            ticks: 15,
            grid: true,
            label: "Months",
            domain: [months[0].date, months[months.length - 1].date],

        },
        y: {
            label: "Consumption (kWh)",
            grid: true,
            domain: [200, 550],

        },
        marks: [
            Plot.line(months, {
                x: "date",
                y: "kwhs",
                stroke: "#7aa2f7",
                strokeWidth: 1.5,
                curve: "natural"
            })
        ]
    });
    container.appendChild(plot);
}

function plotYearlyComparison(container, months) {
    const plot = Plot.plot({
        width: 800,
        height: 350,
        marginLeft: 50,
        color: {
            type: "categorical",
            scheme: "Tableau10",
            legend: true
        },
        x: {
            ticks: 12,
            grid: true,
            label: "Month",
            type: "time",
            tickFormat: "%b",
            domain: [new Date(2022, 0, 1), new Date(2022, 11, 31)]
        },
        y: {
            label: "Consumption (kWh)",
            grid: true,
            color:"black",
            domain: [200, 550]
        },
        marks: [
            Plot.line(months, {
                x: "fakedate",
                y: "kwhs",
                stroke: "year",
                strokeWidth: 2,
                curve: "natural"
            })
        ]
    });
    container.appendChild(plot);
}

function plotScatter(container, days) {
    const plot = Plot.plot({
        width: 800,
        height: 400,
        marginLeft: 60,
        marginBottom: 50,
        x: {
            label: "Consumption (kWh)",
            grid: true,
        },
        y: {
            label: "Daylight (minutes)",
            grid: true
        },
        marks: [
            Plot.dot(days, {
                x: "kwhs",
                y: "daylight",
                fill: "#7aa2f7",
                fillOpacity: 1,
                r: 3
            })
        ]
    });
    container.appendChild(plot);
}

function plotRadialAnnualChart(container, data) {
    const width = 700;
    const height = 700;
    const innerRadius = width / 5;
    const outerRadius = width / 2 - 40;

    const x = d3.scaleTime()
        .domain([new Date(2022, 0, 1), new Date(2022, 11, 31)])
        .range([0, 2 * Math.PI]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.kwhs_max, d.day_hs)) + 2])
        .range([innerRadius, outerRadius]);

    const area = d3.areaRadial()
        .curve(d3.curveBasis)
        .angle(d => x(d.date));

    const line = d3.lineRadial()
        .curve(d3.curveBasis)
        .angle(d => x(d.date));

    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .style("max-width", "100%")
        .style("height", "auto");

    // Month labels and grid
    const months = d3.timeMonths(new Date(2022, 0, 1), new Date(2023, 0, 1));

    svg.append("g")
        .attr("font-family", "var(--font-body, sans-serif)")
        .attr("font-size", 11)
        .attr("fill", "#888")
        .selectAll("g")
        .data(months)
        .join("g")
        .each(function(d) {
            const g = d3.select(this);
            // Radial grid lines
            g.append("path")
                .attr("stroke", "#444")
                .attr("stroke-opacity", 1)
                .attr("d", `M${d3.pointRadial(x(d), innerRadius)}L${d3.pointRadial(x(d), outerRadius)}`);
            // Month labels
            const angle = x(d) - Math.PI / 2;
            const labelRadius = outerRadius + 15;
            g.append("text")
                .attr("transform", `translate(${Math.cos(angle) * labelRadius},${Math.sin(angle) * labelRadius})`)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .text(d3.timeFormat("%b")(d));
        });

    // Circular grid lines
    svg.append("g")
        .selectAll("circle")
        .data(y.ticks(5))
        .join("circle")
        .attr("fill", "none")
        .attr("stroke", "#444")
        .attr("stroke-opacity", 0.5)
        .attr("r", y);

    // Y-axis labels
    svg.append("g")
        .attr("font-family", "var(--font-body, sans-serif)")
        .attr("font-size", 10)
        .attr("fill", "#888")
        .selectAll("text")
        .data(y.ticks(5).filter(d => d > 0))
        .join("text")
        .attr("y", d => -y(d))
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(d => d + " kWh");

    // Daylight hours (yellow background)
    svg.append("path")
        .attr("fill", "#ffd700")
        .attr("fill-opacity", 0.5)
        .attr("d", area
            .innerRadius(d => y(0))
            .outerRadius(d => y(d.day_hs))
            (data));

    // Min/max range (light blue)
    svg.append("path")
        .attr("fill", "#7aa2f7")
        .attr("fill-opacity", 0.5)
        .attr("d", area
            .innerRadius(d => y(d.kwhs_min))
            .outerRadius(d => y(d.kwhs_max))
            (data));

    // Quartile range (darker blue)
    svg.append("path")
        .attr("fill", "#7aa2f7")
        .attr("fill-opacity", 0.5)
        .attr("d", area
            .innerRadius(d => y(d.kwhs_q_lower))
            .outerRadius(d => y(d.kwhs_q_upper))
            (data));

    // Median line
    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", "#3d59a1")
        .attr("stroke-width", 2)
        .attr("d", line.radius(d => y(d.kwhs_median))(data));

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${-width/2 + 10},${-height/2 + 10})`)
        .attr("font-family", "var(--font-body, sans-serif)")
        .attr("font-size", 12);

    const legendItems = [
        { color: "rgba(122, 162, 247, 1)", text: "Min/max consumption" },
        { color: "rgba(122, 162, 247, 1)", text: "Quartile range (25-75%)" },
        { color: "#3d59a1", text: "Median", isLine: true },
        { color: "rgba(255, 215, 0, 1)", text: "Daylight hours" }
    ];

    legendItems.forEach((item, i) => {
        const g = legend.append("g").attr("transform", `translate(0,${i * 22})`);

        if (item.isLine) {
            g.append("line")
                .attr("x1", 0).attr("x2", 18)
                .attr("y1", 8).attr("y2", 8)
                .attr("stroke", item.color)
                .attr("stroke-width", 2);
        } else {
            g.append("rect")
                .attr("width", 18).attr("height", 16)
                .attr("fill", item.color)
                .attr("stroke", "#000")
                .attr("stroke-width", 0.5);
        }

        g.append("text")
            .attr("x", 24).attr("y", 12)
            .attr("fill", "#000")
            .text(item.text);
    });

    container.appendChild(svg.node());
}

// =============================================================================
// INITIALIZATION
// =============================================================================

async function initVisualizations() {
    try {
        // Show loading state
        document.querySelectorAll('.viz-container').forEach(el => {
            el.innerHTML = '<p style="color: #888; font-style: italic;">Loading visualization...</p>';
        });

        // Load data
        const [monthlyData, radialData, daylightData] = await Promise.all([
            loadMonthlyData(),
            loadRadialData(),
            loadDailyDataWithDaylight()
        ]);

        // Calculate correlation
        const kwhs = daylightData.map(d => d.kwhs);
        const daylight = daylightData.map(d => d.daylight);
        const correlation = ss.sampleCorrelation(kwhs, daylight);

        // Render visualizations
        const radialContainer = document.getElementById('viz-radial');
        if (radialContainer) {
            radialContainer.innerHTML = '';
            plotRadialAnnualChart(radialContainer, radialData);
        }

        const monthlyContainer = document.getElementById('viz-monthly');
        if (monthlyContainer) {
            monthlyContainer.innerHTML = '';
            plotMonthlyConsumption(monthlyContainer, monthlyData);
        }

        const yearlyContainer = document.getElementById('viz-yearly');
        if (yearlyContainer) {
            yearlyContainer.innerHTML = '';
            plotYearlyComparison(yearlyContainer, monthlyData);
        }

        const scatterContainer = document.getElementById('viz-scatter');
        if (scatterContainer) {
            scatterContainer.innerHTML = '';
            plotScatter(scatterContainer, daylightData);

            // Add correlation info
            const info = document.createElement('p');
            info.style.cssText = 'font-size: 0.9em; color: #888; margin-top: 0.5em;';
            info.textContent = `Correlation coefficient: r = ${correlation.toFixed(3)}`;
            scatterContainer.appendChild(info);
        }

    } catch (error) {
        console.error('Error initializing visualizations:', error);
        document.querySelectorAll('.viz-container').forEach(el => {
            el.innerHTML = `<p style="color: #f7768e;">Error loading visualization: ${error.message}</p>`;
        });
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualizations);
} else {
    initVisualizations();
}
