module.exports = {
    default: {
        require: [
            'steps/**/*.js',
            'support/world.js',
            'support/hooks.js'
        ],
        paths: ['features/**/*.feature'],
        format: [
            'progress-bar',
            'json:reports/cucumber-report.json',
            'html:reports/cucumber-report.html'
        ],
        formatOptions: {
            snippetInterface: 'async-await'
        },
        publishQuiet: true,
        retry: 0  // Set to 1 or 2 for flaky test resilience; use --retry CLI flag to override
    }
};
