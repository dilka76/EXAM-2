document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const revenueInput = document.getElementById('revenue');
    const aovInput = document.getElementById('aov');
    const leadRateInput = document.getElementById('leadRate');
    const prospectRateInput = document.getElementById('prospectRate');
    
    // Date Inputs
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Displays
    const leadRateDisplay = document.getElementById('leadRateDisplay');
    const prospectRateDisplay = document.getElementById('prospectRateDisplay');

    // KPI Values
    const prospectsValue = document.getElementById('prospectsValue');
    const leadsValue = document.getElementById('leadsValue');
    const customersValue = document.getElementById('customersValue');

    // KPI Percents & Progress
    const leadsPercent = document.getElementById('leadsPercent');
    const customersPercent = document.getElementById('customersPercent');
    const leadsProgress = document.getElementById('leadsProgress');
    const customersProgress = document.getElementById('customersProgress');

    // Tooltip
    const tooltip = document.getElementById('tooltip');

    function diffInMonths(date1, date2) {
        let d1 = new Date(date1);
        let d2 = new Date(date2);
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 1 : months; 
    }

    function calculate() {
        // Values
        let revenue = parseFloat(revenueInput.value) || 0;
        let aov = parseFloat(aovInput.value) || 1;
        let leadRate = parseFloat(leadRateInput.value) || 1;
        let prospectRate = parseFloat(prospectRateInput.value) || 1;

        // Formula 01: Customers
        let customers = revenue / aov;

        // Formula 02: Leads (Potential Customers)
        // Formula in image description: Customers * 100 / leadRate
        let leads = (customers * 100) / leadRate;

        // Formula 03: Prospects (Contacts)
        // Formula in image description: Potential Customers * 100 / prospectRate
        let prospects = (leads * 100) / prospectRate;

        // Update Slider Displays
        leadRateDisplay.innerText = leadRate.toFixed(2) + '%';
        prospectRateDisplay.innerText = prospectRate.toFixed(2) + '%';

        // Update KPIs
        prospectsValue.innerText = Math.ceil(prospects);
        leadsValue.innerText = Math.ceil(leads);
        customersValue.innerText = Math.ceil(customers);

        // Update Percents
        let lPercent = (leads / prospects) * 100 || 0;
        let cPercent = (customers / prospects) * 100 || 0;

        leadsPercent.innerText = Math.round(lPercent) + '%';
        customersPercent.innerText = Math.round(cPercent) + '%';

        leadsProgress.style.width = lPercent + '%';
        customersProgress.style.width = cPercent + '%';

        renderChart(prospects, leads, customers);
    }

    function renderChart(totalProspects, totalLeads, totalCustomers) {
        const chartContainer = document.getElementById('chartContainer');
        chartContainer.innerHTML = '';

        let monthsDiff = diffInMonths(startDateInput.value, endDateInput.value);
        if (monthsDiff < 1) monthsDiff = 6; // default fallback

        // Calculate max axis value (rounded up nicely)
        let maxAxis = Math.ceil(totalProspects / 20) * 20;
        if(maxAxis === 0) maxAxis = 100;

        // Assuming linear growth for the demonstration over the months
        for (let i = 1; i <= monthsDiff; i++) {
            let row = document.createElement('div');
            row.className = 'chart-row';
            
            let label = document.createElement('div');
            label.className = 'month-label';
            label.innerText = i;
            row.appendChild(label);

            let barsArea = document.createElement('div');
            barsArea.className = 'bars-area';

            // Value distribution: from 1st month (small) to last month (total)
            // It looks cumulative or linearly distributed. In the image:
            // Month 6 has exactly 125.
            // Month 3 has exactly half (~63).
            let currentProspects = (totalProspects / monthsDiff) * i;
            let currentLeads = (totalLeads / monthsDiff) * i;
            let currentCustomers = (totalCustomers / monthsDiff) * i;

            let pWidth = (currentProspects / maxAxis) * 100;
            let lWidth = (currentLeads / maxAxis) * 100;
            let cWidth = (currentCustomers / maxAxis) * 100;

            let pBar = createBar('bar-prospects', pWidth);
            let lBar = createBar('bar-leads', lWidth);
            let cBar = createBar('bar-customers', cWidth);

            // Tooltip events
            barsArea.addEventListener('mouseenter', (e) => showTooltip(e, i, currentProspects, currentLeads, currentCustomers));
            barsArea.addEventListener('mousemove', moveTooltip);
            barsArea.addEventListener('mouseleave', hideTooltip);

            barsArea.appendChild(pBar);
            barsArea.appendChild(lBar);
            barsArea.appendChild(cBar);

            row.appendChild(barsArea);
            chartContainer.appendChild(row);
        }

        // Add X Axis
        let xAxis = document.createElement('div');
        xAxis.className = 'x-axis';
        let step = maxAxis / 6;
        for (let i = 0; i <= 6; i++) {
            let span = document.createElement('span');
            span.innerText = Math.round(i * step) + ' people';
            xAxis.appendChild(span);
        }
        chartContainer.appendChild(xAxis);
    }

    function createBar(className, widthPercent) {
        let bar = document.createElement('div');
        bar.className = className;
        bar.style.width = widthPercent + '%';
        return bar;
    }

    function showTooltip(e, month, p, l, c) {
        tooltip.style.display = 'block';
        tooltip.innerHTML = `Month #${month}<br>Prospects: ${Math.round(p)}<br>Leads: ${Math.round(l)}<br>Customers: ${Math.round(c)}`;
        moveTooltip(e);
    }

    function moveTooltip(e) {
        tooltip.style.left = e.pageX + 15 + 'px';
        tooltip.style.top = e.pageY + 15 + 'px';
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    // Event Listeners
    revenueInput.addEventListener('input', calculate);
    aovInput.addEventListener('input', calculate);
    leadRateInput.addEventListener('input', calculate);
    prospectRateInput.addEventListener('input', calculate);
    startDateInput.addEventListener('change', calculate);
    endDateInput.addEventListener('change', calculate);

    // Initial calculation
    calculate();
});
