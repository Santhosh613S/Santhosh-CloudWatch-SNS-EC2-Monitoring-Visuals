# AWS Cloud Monitoring Lab — EC2 CPU Utilization, CloudWatch & SNS

**Branding:** `#BuildwithCloudmessenger`  
**Project folder:** `cloudwatch-sns-ec2-cpu-monitoring-visual`

An animated, responsive, beginner-friendly educational simulation showing how Amazon EC2 CPU utilization metrics can be evaluated by Amazon CloudWatch alarms and routed to an Amazon SNS topic for email notification.

> **Educational simulation only.** This static project does not create, inspect, or monitor AWS resources. It does not send email, make network calls from the application, or require AWS credentials.

## Learning objectives

- Explain EC2 CPU utilization and basic versus detailed monitoring.
- Follow the flow from EC2 metrics to CloudWatch graphs and alarms.
- Configure a simulated threshold, metric period, comparison, and evaluation periods.
- Understand the `OK`, `ALARM`, and `INSUFFICIENT_DATA` states.
- See how a configured CloudWatch alarm action can publish to an SNS topic.
- Understand why email subscriptions need confirmation and why notifications do not automatically repair an instance.
- Practice a first-pass Cloud Support Engineer troubleshooting checklist.

## AWS services in the story

- **Amazon EC2:** virtual computing capacity running Ravi's online shopping website.
- **Amazon CloudWatch:** collects and stores metrics, displays monitoring information, and evaluates alarm conditions.
- **Amazon SNS:** a pub/sub messaging service. A topic distributes a published message to subscribed endpoints such as a confirmed email subscription.

## Nine learning steps

1. **EC2 Instance** — Santhosh launches a virtual web server for Ravi's shopping site.
2. **CPU Metrics** — CPU utilization is represented as a percentage; example readings are simulated.
3. **CloudWatch** — CPU readings appear in a monitoring graph.
4. **Alarm Configuration** — Set a name, threshold, period, evaluation-period count, and comparison operator.
5. **Threshold Breach** — Change simulated CPU utilization and observe the threshold.
6. **Alarm State** — Explore `OK`, `ALARM`, and `INSUFFICIENT_DATA`.
7. **Amazon SNS** — Demonstrate the configured alarm action and topic.
8. **Email Alert** — Inspect and acknowledge a simulated email notification.
9. **Complete Architecture** — Review the end-to-end monitoring flow and troubleshooting notes.

## Architecture flow

`EC2 instance → CloudWatch metrics → CloudWatch alarm → configured alarm action → SNS topic → confirmed email subscription → Santhosh`

CloudWatch and SNS can detect and communicate a condition. This design does **not** automatically reduce CPU utilization, repair an instance, or scale capacity. Those behaviors require separate remediation or scaling configuration.

## Moving-object legend

- **Metric packet:** simulated EC2 CPU metric flowing to CloudWatch.
- **Alarm signal:** configured alarm state-change notification action.
- **Envelope:** simulated SNS email notification.
- **CPU gauge:** current simulated utilization.
- **Green check / green status:** normal state or successful local demo action.
- **Red warning:** simulated threshold breach / `ALARM`.
- **Gold dashed line:** configured CPU threshold.
- **Chart:** simulated CPU utilization history.
- **Cloud icon:** visual cloud-service cue.

Use the legend controls in the UI to reveal plain-language explanations.

## Interactive controls

- **Play / Pause / Reset:** auto-advance through steps every five seconds, pause, or restore initial demo state.
- **Step navigation:** jump to any of the nine steps.
- **CPU slider and presets:** set CPU to Normal (25%), Moderate (55%), High (85%), or Critical (96%).
- **Threshold slider:** adjust the configured threshold from 1% to 100%.
- **Alarm settings:** change alarm label, metric period, evaluation-period count, and comparison operator.
- **Evaluate alarm:** add a sample and evaluate the simplified local rule.
- **Simulate alarm:** force an `ALARM` state to demonstrate the path.
- **Send test notification:** create a local simulated notification (no email is sent).
- **Acknowledge alert:** mark the demo notification acknowledged.
- **Recover server load:** return CPU to 25% and demonstrate recovery when the local criteria allow it.
- **Theme toggle:** switch between dark and light themes.
- **Keyboard:** use Left/Right arrows to change steps and Space to toggle Play/Pause when focus is not in a form field.
- **Reduced motion:** CSS and animation behavior respect `prefers-reduced-motion`.

## Prerequisites

- A modern desktop or mobile browser.
- Python 3 for the optional local HTTP server.
- Node.js is optional and only needed for the JavaScript syntax check.

No AWS account, credentials, npm, bundler, or third-party JavaScript library is required. The font stylesheet references Google Fonts as a progressive enhancement; system fallbacks are included and the simulation works without that font download.

## Run locally

From inside the project folder, run:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

You can also open `index.html` directly, though a local HTTP server more closely matches static hosting behavior.

## GitHub repository setup

1. Create a new repository on GitHub, for example `cloudwatch-sns-ec2-cpu-monitoring-visual`.
2. Extract this ZIP and upload the **contents** of the project folder to the repository root.
3. Commit the files to the default branch (usually `main`).

## Publish with GitHub Pages

1. Open the repository on GitHub and choose **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select `main` and `/ (root)`, then click **Save**; wait for the published Pages URL to appear.

## Project structure

```text
cloudwatch-sns-ec2-cpu-monitoring-visual/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── .nojekyll
├── LICENSE
└── README.md
```

## Customization guide

- **Story text:** edit the `steps` array near the top of `js/app.js`.
- **Colors and themes:** adjust CSS custom properties in `:root` and `body.light` in `css/style.css`.
- **CPU presets:** update the `data-cpu` values on the preset buttons in `index.html`.
- **Alarm threshold defaults:** update the threshold slider and `state.threshold` in `js/app.js`.
- **Architecture diagram:** edit the inline SVG in `index.html`; retain its accessible title and description.
- **Dashboard history:** update the initial `history` values in `js/app.js`. Values are explicitly educational simulated data.
- **Branding:** change `#BuildwithCloudmessenger` in the header, footer, and README.

## Technical accuracy notes and simulation limitations

- EC2 sends standard monitoring metrics to CloudWatch by default. Basic monitoring for most EC2 metrics commonly uses five-minute intervals; detailed monitoring can provide one-minute intervals and may incur additional charges.
- `CPUUtilization` is a percentage metric.
- Real CloudWatch alarm evaluation depends on the metric statistic, period, threshold, comparison operator, evaluation configuration, and data availability. A single high sample does not necessarily trigger every real alarm.
- The browser demo uses a deliberately simplified consecutive-sample rule. It is not a reimplementation of CloudWatch's full M-of-N, missing-data, or evaluation behavior.
- The UI's simulated `INSUFFICIENT_DATA` state is illustrative, not an exact reproduction of service behavior.
- SNS email delivery in a real setup requires a configured topic, an alarm action targeting that topic, a valid email subscription, and subscription confirmation.
- The example `i-example123` and `santhosh@example.invalid` are fictional placeholders.
- All notification messages remain inside the browser. No real AWS resources, credentials, or customer data are used.

## Suggested next steps for a real AWS implementation

1. Create or choose an EC2 instance and verify the intended CloudWatch metric is available.
2. Create a CloudWatch alarm for `AWS/EC2` / `CPUUtilization` with a suitable statistic, period, threshold, and evaluation settings.
3. Create an SNS topic and email subscription; confirm the subscription from the confirmation message.
4. Configure the CloudWatch alarm action for the desired alarm state to publish to the SNS topic.
5. Test with a safe workload in a non-production environment and verify alarm history, SNS delivery, and subscription status.
6. Apply least-privilege access, cost awareness, and operational runbooks. Consider scaling or automated remediation separately if needed.

## Screenshots

Screenshots are not included in this package yet. Add project screenshots here after capturing the interface in a browser, for example:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/architecture.png`
- `docs/screenshots/email-alert.png`

## License

**License terms require confirmation.** The project brief refers to an “EduBridge license” but does not provide its text or a verifiable license URL. The included `LICENSE` file is therefore a placeholder; replace it with the exact authorized license terms before publishing or redistributing. Do not assume permissions from this placeholder.
