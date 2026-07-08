const axios = require('axios');

async function initiateSustainedStressProfile() {
    const endpoint = "http://localhost:5000/api/projects";
    const volumeTargets = 150;
    const batchConcurrency = 15;

    console.log(`⚡ Launching API Soak Engine on Target: ${endpoint}`);
    console.log(`⚡ Spawning ${volumeTargets} transactional executions in parallel bursts of ${batchConcurrency}...`);

    const mockPayload = {
        title: "Automated Microservice Load Benchmark Project",
        agency: "DST-LOAD-CORE",
        amount: 450000.00,
        pi: "G. V. Vinay Krishna",
        copi: "Virtual Cluster Bot",
        utilization_report_path: "/uploads/automated-load.pdf"
    };

    let successes = 0;
    let failures = 0;
    const trackingStart = Date.now();

    for (let i = 0; i < volumeTargets; i += batchConcurrency) {
        const concurrentPool = [];
        for (let b = 0; b < batchConcurrency && (i + b) < volumeTargets; b++) {
            concurrentPool.push(
                axios.post(endpoint, mockPayload)
                    .then(() => successes++)
                    .catch(() => failures++)
            );
        }
        await Promise.all(concurrentPool);
    }

    const testDuration = ((Date.now() - trackingStart) / 1000).toFixed(2);
    console.log(`\n================ TRANSACTION LOAD METRICS ================`);
    console.log(`⏱️ Total Execution Windows: ${testDuration} seconds`);
    console.log(`✅ Clean Writes Generated: ${successes}`);
    console.log(`❌ Interrupted Connections / Drops: ${failures}`);
    console.log(`📊 Pipeline Density: ${(successes / testDuration).toFixed(1)} transactions/sec\n`);
}

initiateSustainedStressProfile();