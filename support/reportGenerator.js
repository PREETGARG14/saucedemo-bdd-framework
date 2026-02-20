/**
 * Report Generator – Creates a rich HTML report from Cucumber JSON output.
 *
 * Run: node support/reportGenerator.js
 */
const reporter = require('multiple-cucumber-html-reporter');
const path = require('path');
const fs = require('fs');

const jsonReportPath = path.join(process.cwd(), 'reports', 'cucumber-report.json');

if (!fs.existsSync(jsonReportPath)) {
    console.error('No cucumber-report.json found. Run tests first with: npm test');
    process.exit(1);
}

reporter.generate({
    jsonDir: path.join(process.cwd(), 'reports'),
    reportPath: path.join(process.cwd(), 'reports', 'html-report'),
    metadata: {
        browser: {
            name: 'chromium',
            version: 'latest',
        },
        device: 'Local Machine',
        platform: {
            name: process.platform,
            version: process.version,
        },
    },
    customData: {
        title: 'SauceDemo BDD Test Report',
        data: [
            { label: 'Project', value: 'SauceDemo BDD Framework' },
            { label: 'Framework', value: 'Playwright + Cucumber.js' },
            { label: 'Execution Date', value: new Date().toISOString() },
        ],
    },
    reportName: 'SauceDemo BDD Test Report',
    pageTitle: 'SauceDemo Test Results',
    displayDuration: true,
    displayReportTime: true,
});

// Post-process: remove third-party branding from the generated report
const reportHtmlPath = path.join(process.cwd(), 'reports', 'html-report', 'index.html');
if (fs.existsSync(reportHtmlPath)) {
    let html = fs.readFileSync(reportHtmlPath, 'utf8');
    html = html.replace(/<div class="created-by">[\s\S]*?<\/div>/g, '');
    fs.writeFileSync(reportHtmlPath, html, 'utf8');
}

console.log('✓ HTML report generated at: reports/html-report/index.html');
