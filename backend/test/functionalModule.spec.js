const assert = require('assert');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

describe('Funded Projects Module - Authenticated API Integration Tests', function () {
    this.timeout(10000); 
    const BASE_URL = 'http://localhost:5000/api';
    let authToken = '';

    // Step 1: Programmatically capture JWT token before running any test paths
    before(async function () {
        try {
            const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: '24071a6615@vnrvjiet.in',
                password: 'vnrvjiet'
            });
            
            // Adapt token retrieval based on your backend response structure
            authToken = loginResponse.data.token || loginResponse.data.accessToken;
            console.log('   🔒 JWT Handshake successful. Token secured for automation loop.');
        } catch (err) {
            console.log('   ⚠️ Authentication pre-hook failed. Falling back to default header simulation...');
            // Fallback token placeholder in case auth route differs (helps pinpoint error)
            authToken = 'MOCK_TOKEN_STRING';
        }
    });

    it('TC-PATH-003 (ECP-Valid): Should successfully ingest a project with text fields only', async function () {
        const payload = {
            title: 'PraṇaŚaktiNet: Decentralized TinyML Optimization',
            agency: 'DST-SERB',
            amount: 850000.00,
            pi: 'G. V. Vinay Krishna',
            copi: 'Core Team Collaborator'
        };

        const response = await axios.post(`${BASE_URL}/projects`, payload, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        
        assert.strictEqual(response.status, 201 || response.status === 200);
        assert.ok(response.data);
        console.log('   ✅ Text-only entry committed seamlessly with JWT Auth!');
    });

    it('TC-PATH-004: Should stream multipart form data with a PDF document via Multer cleanly', async function () {
        const mockFilePath = path.join(__dirname, 'temp-report.pdf');
        fs.writeFileSync(mockFilePath, '%PDF-1.4 Mock Automation Content Stream');

        const form = new FormData();
        form.append('title', 'Edge Computing Trust Index Modeling');
        form.append('agency', 'AICTE');
        form.append('amount', '1200000.00');
        form.append('pi', 'G. V. Vinay Krishna');
        form.append('copi', 'R&D Team Alpha');
        form.append('file', fs.createReadStream(mockFilePath)); 

        const response = await axios.post(`${BASE_URL}/projects`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${authToken}`
            }
        });

        assert.strictEqual(response.status, 201 || response.status === 200);
        assert.ok(response.data);
        console.log('   ✅ Multipart file stream authenticated and parsed by Multer successfully!');

        if (fs.existsSync(mockFilePath)) {
            fs.unlinkSync(mockFilePath);
        }
    });
});