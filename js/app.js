/* AWS Cloud Monitoring Lab — local educational simulation only. */
(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const steps = [
    {title:"A website needs a home",plain:"Think of EC2 as a computer rented in the cloud. It runs Ravi’s online shopping website.",technical:"Amazon Elastic Compute Cloud (Amazon EC2) provides resizable virtual computing capacity. High CPU can indicate a heavy workload, but does not automatically mean the instance is failing.",picture:"Customer requests reach the web server and the CPU meter becomes active.",diagram:"Your web server is online"},
    {title:"Give the workload a number",plain:"A speedometer helps you understand how hard a car is working. CPUUtilization is a similar signal for the processor.",technical:"EC2 publishes basic monitoring metrics to CloudWatch by default. Most EC2 basic metrics use a five-minute interval; detailed monitoring can provide one-minute intervals and may incur additional charges.",picture:"Metric packets travel from EC2 toward CloudWatch. The readings shown here are simulated: 24%, 35%, 48%, and 76%.",diagram:"CPU metrics are on the move"},
    {title:"Meet the monitoring officer",plain:"CloudWatch is like a dashboard that keeps a history of the server’s vital signs.",technical:"Amazon CloudWatch collects and stores metrics, displays graphs and dashboards, and evaluates alarm conditions. Monitoring alone does not automatically fix performance issues.",picture:"The CPU history graph updates from the simulated samples.",diagram:"CloudWatch is watching"},
    {title:"Set the alarm rule",plain:"Choose a line on the speedometer. If the measured value meets your rule for long enough, the alarm can change state.",technical:"A CloudWatch alarm evaluates a metric statistic, period, comparison operator, threshold, and evaluation settings. Real evaluation behavior is more nuanced than this local demo.",picture:"The gold dashed line marks your threshold. Adjust it in Alarm configuration.",diagram:"Configure a CPU alarm"},
    {title:"The load climbs",plain:"More customers arrive at the store, so the server works harder. Move the CPU slider to simulate the rush.",technical:"A threshold breach is determined by the configured metric evaluation—not just by how high a line looks. This demo uses consecutive local samples as a simplified rule.",picture:"The CPU gauge and chart react to the load. Try High Load or Critical Load.",diagram:"What happens when CPU spikes?"},
    {title:"The alarm changes state",plain:"The alarm is a signal light: green when the condition is not breached, red when it is, and neutral when there is not enough data.",technical:"CloudWatch alarm states are OK, ALARM, and INSUFFICIENT_DATA. Alarm actions can be configured for selected state changes.",picture:"The alarm state updates according to the current simulated evaluation. A signal can travel to the notification action.",diagram:"Evaluate the alarm state"},
    {title:"Send it through SNS",plain:"SNS is the messenger. A topic lets one published message reach its subscribed endpoints.",technical:"A CloudWatch alarm can publish to an Amazon Simple Notification Service (SNS) topic through a configured alarm action. Email delivery needs an email subscription that has been confirmed.",picture:"A simulated alarm message moves toward the SNS topic santhosh-ec2-cpu-alerts.",diagram:"The notification messenger is ready"},
    {title:"An alert reaches the inbox",plain:"Santhosh receives a message that gives him a useful starting point for investigation.",technical:"This sample email is simulated. No email is sent and no AWS resources are contacted. Real delivery depends on the alarm action, SNS topic, subscription status, and service configuration.",picture:"Open the simulated email, acknowledge it, or recover the server load.",diagram:"A simulated alert arrives"},
    {title:"See the whole architecture",plain:"The monitoring chain observes, evaluates, and notifies. It does not repair the server by itself.",technical:"EC2 → CloudWatch metrics → CloudWatch alarm → configured alarm action → SNS topic → confirmed email subscription. Remediation or scaling requires additional configuration.",picture:"All architecture components are visible. Use the controls to test another scenario.",diagram:"The complete monitoring workflow"}
  ];
  const state = {step:0,cpu:25,threshold:80,alarm:"OK",history:[24,35,48,76,42,39,51,25],samples:[],notification:"Idle",acknowledged:false,playing:false,timer:null,theme:"dark",event:"Simulation ready",eventDetail:"CPU is at 25%. Explore a preset or adjust the slider."};
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chart = {left:48,right:600,top:20,bottom:180};
  function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");window.clearTimeout(toast.timer);toast.timer=window.setTimeout(()=>el.classList.remove("show"),2500);}
  function setEvent(title,detail){state.event=title;state.eventDetail=detail;$("#eventLog strong").textContent=title;$("#eventLog p").textContent=detail;}
  function setStep(index){
    state.step=Math.max(0,Math.min(8,index));
    const item=steps[state.step];
    $("#stepCount").textContent=String(state.step+1).padStart(2,"0")+" / 09";
    $("#captionStep").textContent="STEP "+String(state.step+1).padStart(2,"0");
    $("#stepHeadline").textContent=item.title;$("#plainWords").textContent=item.plain;$("#technicalName").textContent=item.technical;$("#watchPicture").textContent=item.picture;$("#diagramTitle").textContent=item.diagram;
    $$(".step-link").forEach((b,i)=>{b.classList.toggle("active",i===state.step);b.setAttribute("aria-current",i===state.step?"step":"false");});
    $$(".revealed").forEach(el=>{const n=Number(el.dataset.reveal||0);const visible=n<=state.step || state.step===8;el.classList.toggle("is-hidden",!visible);if(visible&&!el.dataset.wasVisible){el.classList.add("just-revealed");el.dataset.wasVisible="1";if(!reducedMotion)window.setTimeout(()=>el.classList.remove("just-revealed"),800);}});
    if(state.step===8){$$(".revealed").forEach(el=>el.classList.remove("is-hidden"));}
    if(state.step>=7 && state.notification!=="Idle")$("#emailCard").hidden=false;
    render();
  }
  function alarmCondition(value){return $("#comparison").value==="gte"?value>=state.threshold:value>state.threshold;}
  function evaluateAlarm(force){
    const periods=Number($("#evalPeriods").value);
    const breached=alarmCondition(state.cpu);
    if(force){state.samples=Array(periods).fill(state.cpu);setAlarm("ALARM","Manually simulated alarm action");return;}
    state.samples.push(state.cpu);state.samples=state.samples.slice(-periods);
    if(state.samples.length<periods){setAlarm("INSUFFICIENT_DATA","Collecting samples for configured evaluation periods");return;}
    const count=state.samples.filter(alarmCondition).length;
    if(count===periods){setAlarm("ALARM",`${count} of ${periods} simulated period(s) breached the condition`);}
    else if(count===0){setAlarm("OK",`Condition not breached across ${periods} simulated period(s)`);}
    else {setAlarm("INSUFFICIENT_DATA",`Mixed samples: ${count} of ${periods} breached in this simplified model`);}
  }
  function setAlarm(next,detail){
    const previous=state.alarm;state.alarm=next;
    if(previous!==next){
      setEvent("Alarm state changed: "+previous+" → "+next,detail);
      if(next==="ALARM" && state.step>=6)$("#svgAlarmState").textContent="ALARM";
      if(next==="ALARM" && state.step>=6)$("#alarmPacket").setAttribute("visibility","visible");
      if(next==="ALARM" && state.step>=6)$("#alarmPacket").querySelector("animateMotion").beginElement?.();
    }else if(detail){$("#alarmDetail").textContent=detail;}
    render();
  }
  function setCpu(value,record=true){
    state.cpu=Math.max(0,Math.min(100,Number(value)||0));
    if(record){state.history.push(state.cpu);state.history=state.history.slice(-18);}
    $("#cpuSlider").value=state.cpu;$("#cpuSliderLabel").textContent=state.cpu+"%";
    const band=state.cpu>=90?"Critical load":state.cpu>=80?"High load":state.cpu>=50?"Moderate load":"Normal load";
    $("#cpuBand").textContent=band;
    if(state.cpu>=state.threshold)$("#cpuBand").style.color="var(--red)";else $("#cpuBand").style.color="var(--green)";
    render();
  }
  function renderChart(){
    const values=state.history.slice(-18);while(values.length<2)values.unshift(values[0]||0);
    const xstep=(chart.right-chart.left)/(values.length-1);
    const points=values.map((v,i)=>({x:chart.left+i*xstep,y:chart.bottom-(v/100)*(chart.bottom-chart.top)}));
    const path=points.map((p,i)=>(i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" ");
    $("#chartPath").setAttribute("d",path);
    $("#chartArea").setAttribute("d",path+` L ${chart.right} ${chart.bottom} L ${chart.left} ${chart.bottom} Z`);
    const last=points[points.length-1];$("#chartPoint").setAttribute("cx",last.x);$("#chartPoint").setAttribute("cy",last.y);
    $("#chartPoint").setAttribute("fill",state.cpu>=state.threshold?"#ff797e":"#79e5b6");
    const thresholdY=chart.bottom-(state.threshold/100)*(chart.bottom-chart.top);
    $("#thresholdLine").setAttribute("y1",thresholdY);$("#thresholdLine").setAttribute("y2",thresholdY);$("#thresholdLabel").setAttribute("y",Math.max(12,thresholdY-7));$("#thresholdLabel").textContent="THRESHOLD "+state.threshold+"%";
    const mini=values.slice(-7);const mp=mini.map((v,i)=>({x:348+i*(132/Math.max(1,mini.length-1)),y:230-(v/100)*65}));
    $("#miniChart").setAttribute("d",mp.map((p,i)=>(i?"L":"M")+p.x+" "+p.y).join(" "));
  }
  function render(){
    $("#cpuValue").textContent=state.cpu;$("#cpuMeter").style.width=state.cpu+"%";$("#cpuMeter").style.background=state.cpu>=state.threshold?"var(--red)":state.cpu>=50?"var(--gold)":"var(--green)";
    $("#chartCurrent").textContent=state.cpu+"%";$("#thresholdReadout").textContent=state.threshold+"%";$("#thresholdLabel").textContent=state.threshold+"%";$("#thresholdSlider").value=state.threshold;
    $("#svgCpu").textContent=state.cpu+"%";$("#svgCpuBar").setAttribute("width",88*state.cpu/100);$("#svgCpuBar").setAttribute("fill",state.cpu>=state.threshold?"#ff797e":state.cpu>=50?"#f6bd60":"#71e2b0");
    $("#svgAlarmState").textContent=state.alarm;$("#svgAlarmPill").setAttribute("fill",state.alarm==="ALARM"?"#4b202c":state.alarm==="OK"?"#153e30":"#3a3422");$("#svgAlarmPill").setAttribute("stroke",state.alarm==="ALARM"?"#ff797e":state.alarm==="OK"?"#3eaa84":"#f6bd60");$("#svgAlarmState").setAttribute("fill",state.alarm==="ALARM"?"#ff9ca1":state.alarm==="OK"?"#71e2b0":"#f6d38a");
    const stateClass=state.alarm==="ALARM"?"alarm":state.alarm==="OK"?"ok":"neutral";
    $("#alarmStateCard").innerHTML=`<i class="state-indicator ${stateClass}"></i><strong>${state.alarm}</strong>`;
    $("#alarmDetail").textContent=state.alarm==="OK"?"Condition is not breached":state.alarm==="ALARM"?"Configured condition is breached":"Waiting for sufficient simulated data";
    $("#svgSnsStatus").textContent=state.notification==="Delivered"?"MESSAGE READY":state.notification==="Acknowledged"?"ACKNOWLEDGED":"WAITING";
    $("#svgEmailStatus").textContent=state.notification==="Idle"?"No notification yet":state.notification==="Acknowledged"?"Alert acknowledged":"Simulated alert available";
    $("#svgDelivery").textContent=state.notification==="Idle"?"IDLE":state.notification==="Acknowledged"?"ACKNOWLEDGED":"SIMULATED";
    const deliveryClass=state.notification==="Idle"?"neutral":"ok";
    $("#deliveryValue").innerHTML=`<i class="state-indicator ${deliveryClass}"></i><strong>${state.notification}</strong>`;
    $("#deliveryNote").textContent=state.notification==="Idle"?"No simulated message sent":state.notification==="Acknowledged"?"Notification acknowledged locally":"Demo notification generated locally";
    $("#emailCpu").textContent=state.cpu+"%";$("#emailThreshold").textContent=state.threshold+"%";$("#ackStatus").textContent=state.acknowledged?"Acknowledged locally — simulation only":"Waiting for acknowledgement";$("#ackBtn").disabled=state.acknowledged;
    $("#emailCard").hidden=state.notification==="Idle";
    $("#legendHelp").textContent=$("#legendHelp").textContent||"Select a legend item to learn what it means.";
    $$(".preset").forEach(b=>b.classList.toggle("active",Number(b.dataset.cpu)===state.cpu));
    renderChart();
  }
  function sendNotification(test=false){
    state.notification="Delivered";state.acknowledged=false;
    $("#emailCard").hidden=false;setStep(Math.max(state.step,7));
    setEvent(test?"Test notification simulated":"SNS notification simulated",test?"A local demo message was generated. No email or network call occurred.":"A configured alarm state is represented by a simulated SNS notification.");
    $("#emailCard").scrollIntoView({behavior:reducedMotion?"auto":"smooth",block:"nearest"});
    toast("Simulated notification created locally.");
    render();
  }
  function recover(){
    setCpu(25);state.samples=[];state.notification=state.notification==="Idle"?"Idle":"Acknowledged";state.acknowledged=state.notification==="Acknowledged";
    evaluateAlarm(false);
    if(alarmCondition(state.cpu)===false){state.samples=Array(Number($("#evalPeriods").value)).fill(state.cpu);setAlarm("OK","CPU returned to normal; simulated evaluation now satisfies OK criteria");}
    setEvent("Server load recovered","CPU returned to 25%. The alarm returns to OK when simulated evaluation criteria are satisfied.");
    setStep(Math.max(state.step,5));toast("CPU load returned to normal.");
  }
  function play(){if(state.playing)return;state.playing=true;$("#playBtn").disabled=true;$("#pauseBtn").disabled=false;state.timer=window.setInterval(()=>{if(state.step>=8){pause();return;}setStep(state.step+1);},5000);toast("Auto-play started · advances every 5 seconds.");}
  function pause(){state.playing=false;$("#playBtn").disabled=false;$("#pauseBtn").disabled=true;if(state.timer)window.clearInterval(state.timer);state.timer=null;}
  function reset(){
    pause();state.step=0;state.cpu=25;state.threshold=80;state.alarm="OK";state.history=[24,35,48,76,42,39,51,25];state.samples=[];state.notification="Idle";state.acknowledged=false;state.theme="dark";document.body.classList.remove("light");$("#themeToggle").setAttribute("aria-label","Switch to light theme");$("#emailCard").hidden=true;
    $$(".revealed").forEach(el=>{delete el.dataset.wasVisible;el.classList.remove("is-hidden","just-revealed");});
    $("#alarmName").value="ec2-cpu-high-alarm";$("#periodSelect").value="300";$("#evalPeriods").value="2";$("#comparison").value="gt";$("#eventLog time")?.replaceChildren(document.createTextNode("NOW"));
    $("#svgAlarmState").textContent="OK";$("#alarmPacket").setAttribute("visibility","hidden");$("#emailPacket").setAttribute("visibility","hidden");$("#ackStatus").textContent="Waiting for acknowledgement";
    setEvent("Simulation reset","CPU is at 25%. Explore a preset or adjust the slider.");setStep(0);toast("Simulation reset.");
  }
  $$(".step-link").forEach(b=>b.addEventListener("click",()=>{pause();setStep(Number(b.dataset.step));}));
  $("#playBtn").addEventListener("click",play);$("#pauseBtn").addEventListener("click",pause);$("#resetBtn").addEventListener("click",reset);
  $("#cpuSlider").addEventListener("input",e=>{setCpu(e.target.value);});
  $$(".preset").forEach(b=>b.addEventListener("click",()=>{setCpu(b.dataset.cpu);setEvent("CPU load changed",`CPU utilization is now ${state.cpu}%. Choose Evaluate alarm to apply the configured evaluation rule.`);}));
  $("#thresholdSlider").addEventListener("input",e=>{state.threshold=Number(e.target.value);render();setEvent("Threshold updated",`Alarm threshold changed to ${state.threshold}%. Re-evaluate samples to update the alarm state.`);});
  $("#evaluateBtn").addEventListener("click",()=>{evaluateAlarm(false);toast("Alarm evaluated using the local sample rule.");});
  $("#simulateAlarmBtn").addEventListener("click",()=>{if(state.cpu<=state.threshold)setCpu(Math.min(100,Math.max(state.threshold+1,85)));evaluateAlarm(true);setStep(Math.max(state.step,5));setEvent("ALARM state simulated","The demo forced an ALARM state to demonstrate the configured notification path.");$("#alarmPacket").setAttribute("visibility","visible");try{$("#alarmPacket").querySelector("animateMotion").beginElement();}catch(e){}toast("ALARM state simulated.");});
  $("#testNotifyBtn").addEventListener("click",()=>sendNotification(true));
  $("#recoverBtn").addEventListener("click",recover);
  $("#ackBtn").addEventListener("click",()=>{state.acknowledged=true;state.notification="Acknowledged";setEvent("Alert acknowledged","The simulated email is marked as acknowledged locally.");render();toast("Alert acknowledged.");});
  $("#themeToggle").addEventListener("click",()=>{document.body.classList.toggle("light");state.theme=document.body.classList.contains("light")?"light":"dark";$("#themeToggle").setAttribute("aria-label",state.theme==="light"?"Switch to dark theme":"Switch to light theme");});
  $$(".legend-item").forEach(b=>b.addEventListener("click",()=>{const tips={"Metric packet":"Blue/purple dots represent simulated CPU metric data flowing toward CloudWatch.","Alarm signal":"The gold signal represents a CloudWatch alarm state-change action when configured.","Envelope":"The teal path represents an SNS message delivered to an email subscription in this simulation.","CPU gauge":"The CPU gauge displays the current simulated percentage from 0% to 100%.","Gold dashed line":"The gold dashed chart line is the configurable CPU alarm threshold."};$("#legendHelp").textContent=tips[b.dataset.legend]||"A visual cue in the monitoring story."; }));
  $("#alarmName").addEventListener("change",()=>{const name=$("#alarmName").value.trim();if(!name){$("#alarmName").value="ec2-cpu-high-alarm";toast("Alarm name cannot be empty.");}else setEvent("Alarm name updated","This local label is now: "+$("#alarmName").value.trim());});
  // Keyboard shortcuts: left/right navigate steps; space toggles auto-play unless focus is in a form field.
  document.addEventListener("keydown",e=>{if(["INPUT","SELECT","TEXTAREA"].includes(document.activeElement.tagName))return;if(e.key==="ArrowRight"){pause();setStep(Math.min(8,state.step+1));}if(e.key==="ArrowLeft"){pause();setStep(Math.max(0,state.step-1));}if(e.key===" "){e.preventDefault();state.playing?pause():play();}});
  if(reducedMotion){$$(".packet").forEach(el=>{el.querySelectorAll("animateMotion").forEach(anim=>anim.setAttribute("dur","0.01s"));});}
  setStep(0);
})();