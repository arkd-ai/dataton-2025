
let chartInstance = null;

function initChart(ctx, dataValues) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ingresos'],
            datasets: [
                { label: 'Remuneración Cargo Público', data: [dataValues[0]], backgroundColor: '#4A148C' },
                { label: 'Ingreso Anual Neto', data: [dataValues[1]], backgroundColor: '#AB47BC' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { stacked: false },
                y: { 
                    stacked: false,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

export function updateChart(element) {
    // Highlight selected item
    document.querySelectorAll('.declaration-item').forEach(el => {
        el.classList.remove('border-pdn-primary', 'bg-gray-50');
        el.classList.add('border-gray-300');
    });
    element.classList.remove('border-gray-300');
    element.classList.add('border-pdn-primary', 'bg-gray-50');

    // Read data attributes
    const ds = element.dataset;
    console.log(ds)
    const name = ds.nombre || '';
    const apellido = ds.primerApellido || '';
    const segundoApellido = ds.segundoApellido || '';
    
    // Update placeholder text
    const placeholder = document.getElementById('chart-placeholder');
    if (placeholder) {
        placeholder.innerText = `Viendo ingresos de: ${name} ${apellido} ${segundoApellido}`;
    }

    // Prepare data for Chart.js
    const dataValues = [
        parseFloat(ds.remuneracion) || 0,
        parseFloat(ds.ingresoAnual) || 0
    ];
    
    console.log('Chart Data:', dataValues);

    const canvas = document.getElementById('compositionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    if (chartInstance) {
        // Update existing chart data
        chartInstance.data.datasets[0].data[0] = dataValues[0];
        chartInstance.data.datasets[1].data[0] = dataValues[1];
        chartInstance.update();
    } else {
        // Initialize chart
        chartInstance = initChart(ctx, dataValues);
    }
}

export function initializeDashboard() {
    console.log('Initializing dashboard...');
    const items = document.querySelectorAll('.declaration-item');
    console.log(`Found ${items.length} declaration items`);

    // Attach event listeners
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            console.log(`Clicked item ${index}`);
            updateChart(item);
        });
    });

    // Select first item by default
    const firstItem = document.querySelector('.declaration-item');
    if (firstItem) {
        console.log('Selecting first item by default');
        updateChart(firstItem);
    }
}
