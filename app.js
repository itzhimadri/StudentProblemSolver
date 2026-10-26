const STORAGE_KEY = "studyflow.assignments.v1";
const $ = (id) => document.getElementById(id);
const today = new Date();
today.setHours(0, 0, 0, 0);
let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = new Date(today);
let currentView = "dashboard";
let searchTerm = "";

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}
function parseDate(value) {
  const [y,m,d] = value.split("-").map(Number);
  return new Date(y, m-1, d);
}
function formatDate(value, options={day:"numeric",month:"short",year:"numeric"}) {
  if (!value) return "No deadline";
  return parseDate(value).toLocaleDateString("en-IN", options);
}
function daysBetween(dateString) {
  return Math.round((parseDate(dateString) - today) / 86400000);
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function makeId() { return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`); }

const starterTasks = [
  {id:makeId(),title:"Database Design Assignment",subject:"DBMS",date:dateKey(today),time:"17:00",priority:"High",status:"Pending",notes:"Review ER diagrams and normalization."},
  {id:makeId(),title:"Calculus Tutorial",subject:"Mathematics",date:dateKey(today),time:"18:00",priority:"Medium",status:"In Progress",notes:"Complete tutorial questions 1–10."},
  {id:makeId(),title:"Lab Report",subject:"Operating Systems",date:dateKey(new Date(today.getFullYear(),today.getMonth(),today.getDate()+2)),time:"15:00",priority:"Medium",status:"Pending",notes:"Prepare experiment observations."},
  {id:makeId(),title:"Seminar Presentation",subject:"Computer Networks",date:dateKey(new Date(today.getFullYear(),today.getMonth(),today.getDate()+4)),time:"12:00",priority:"Medium",status:"Pending",notes:"Prepare slides and practise."},
  {id:makeId(),title:"Project Submission",subject:"AI Project",date:dateKey(new Date(today.getFullYear(),today.getMonth(),today.getDate()+7)),time:"16:00",priority:"High",status:"Pending",notes:"Check requirements before submission."},
  {id:makeId(),title:"Assignment 2",subject:"Data Structures",date:dateKey(new Date(today.getFullYear(),today.getMonth(),today.getDate()+9)),time:"10:00",priority:"Low",status:"Pending",notes:""},
  {id:makeId(),title:"Research Notes",subject:"Design Thinking",date:dateKey(new Date(today.getFullYear(),today.getMonth(),today.getDate()+12)),time:"14:00",priority:"Low",status:"Completed",notes:""}
];
function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? starterTasks : JSON.parse(stored);
  } catch (e) { return starterTasks; }
}
let tasks = loadTasks();
function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function dueLabel(task) {
  const diff = daysBetween(task.date);
  if (task.status === "Completed") return "Completed";
  if (diff < 0) return `${Math.abs(diff)} day${Math.abs(diff)===1?"":"s"} overdue`;
  if (diff === 0) return `Today, ${task.time || "time not set"}`;
  if (diff === 1) return `Tomorrow, ${task.time || "time not set"}`;
  return `${formatDate(task.date,{day:"numeric",month:"short"})}, ${task.time || "time not set"}`;
}
function taskRow(task) {
  return `<div class="task-row">
    <span class="priority ${escapeHTML(task.priority)}">${escapeHTML(task.priority)}</span>
    <div class="task-main"><div class="task-title" title="${escapeHTML(task.title)}">${escapeHTML(task.title)}</div><div class="task-subject">${escapeHTML(task.subject)}</div></div>
    <div class="task-meta">▣ &nbsp;${escapeHTML(dueLabel(task))}</div>
    <span class="status-pill ${task.status.replace(" ","-")}">${escapeHTML(task.status)}</span>
  </div>`;
}
function renderStats() {
  const pending = tasks.filter(t=>t.status!=="Completed");
  $("totalStat").textContent = tasks.length;
  $("todayStat").textContent = pending.filter(t=>t.date===dateKey(today)).length;
  $("upcomingStat").textContent = pending.filter(t=>daysBetween(t.date)>0).length;
  $("completedStat").textContent = tasks.filter(t=>t.status==="Completed").length;
  $("sideCount").textContent = pending.length;
}
function setEmpty(id, show) { $(id).classList.toggle("hidden", !show); }
function renderDashboard() {
  const pending = tasks.filter(t=>t.status!=="Completed");
  const todayTasks = pending.filter(t=>t.date===dateKey(today)).sort((a,b)=>a.time.localeCompare(b.time));
  const upcoming = pending.filter(t=>daysBetween(t.date)>0).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
  $("todayTasks").innerHTML = todayTasks.map(taskRow).join("");
  $("upcomingTasks").innerHTML = upcoming.map(taskRow).join("");
  setEmpty("todayEmpty", todayTasks.length===0);
  setEmpty("upcomingEmpty", upcoming.length===0);
  const reminders = pending.filter(t=>daysBetween(t.date)>=0).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
  $("reminderList").innerHTML = reminders.map(t=>`<div class="reminder-item"><span class="reminder-mark ${t.priority==="High"?"pink-dot":t.priority==="Medium"?"yellow-dot":"blue-dot"}"></span><div><strong>${escapeHTML(t.title)}</strong><p>${escapeHTML(t.subject)} · ${escapeHTML(formatDate(t.date,{day:"numeric",month:"short"}))}</p><time>${escapeHTML(dueLabel(t))}</time></div></div>`).join("");
  setEmpty("reminderEmpty", reminders.length===0);
}
function renderCalendar() {
  const y=calendarMonth.getFullYear(), m=calendarMonth.getMonth();
  $("monthTitle").textContent = calendarMonth.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  const firstDay = new Date(y,m,1).getDay();
  const daysInMonth = new Date(y,m+1,0).getDate();
  const prevDays = new Date(y,m,0).getDate();
  let html="";
  for(let i=0;i<42;i++){
    let dayNum, date, other=false;
    if(i<firstDay){dayNum=prevDays-firstDay+i+1;date=new Date(y,m-1,dayNum);other=true;}
    else if(i>=firstDay+daysInMonth){dayNum=i-firstDay-daysInMonth+1;date=new Date(y,m+1,dayNum);other=true;}
    else {dayNum=i-firstDay+1;date=new Date(y,m,dayNum);}
    const key=dateKey(date);
    const hasTask=tasks.some(t=>t.date===key && t.status!=="Completed");
    const classes=["day",other?"other-month":"",key===dateKey(today)?"today":"",key===dateKey(selectedDate)?"selected":"",hasTask?"has-task":""].filter(Boolean).join(" ");
    html+=`<button class="${classes}" data-date="${key}" title="${hasTask?"Assignment due":""}">${dayNum}</button>`;
  }
  $("calendarDays").innerHTML=html;
}
function renderTable() {
  const subjectValue=$("subjectFilter").value, statusValue=$("statusFilter").value;
  const filtered=tasks.filter(t=>{
    const matchesSearch=[t.title,t.subject,t.notes].join(" ").toLowerCase().includes(searchTerm);
    return matchesSearch && (subjectValue==="all"||t.subject===subjectValue) && (statusValue==="all"||t.status===statusValue) &&
      (currentView!=="completed"||t.status==="Completed");
  }).sort((a,b)=>a.date.localeCompare(b.date));
  $("allTaskRows").innerHTML=filtered.map(t=>`<tr>
    <td>${escapeHTML(t.title)}${t.notes?`<div class="task-subject">${escapeHTML(t.notes)}</div>`:""}</td>
    <td>${escapeHTML(t.subject)}</td><td>${escapeHTML(formatDate(t.date))}<div class="task-subject">${escapeHTML(t.time||"")}</div></td>
    <td><span class="priority ${escapeHTML(t.priority)}">${escapeHTML(t.priority)}</span></td>
    <td><span class="status-pill ${t.status.replace(" ","-")}">${escapeHTML(t.status)}</span></td>
    <td><div class="table-actions"><button class="small-action" data-edit="${t.id}">Edit</button><button class="small-action" data-toggle="${t.id}">${t.status==="Completed"?"Reopen":"Complete"}</button><button class="small-action" data-delete="${t.id}">Delete</button></div></td>
  </tr>`).join("");
  setEmpty("listEmpty",filtered.length===0);
}
function renderSelectedDate() {
  const chosen=dateKey(selectedDate);
  const matches=tasks.filter(t=>t.date===chosen).sort((a,b)=>a.time.localeCompare(b.time));
  $("selectedDateTasks").innerHTML=`<h3>${selectedDate.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</h3>`+
    (matches.length?matches.map(t=>`<div class="date-task"><div><strong>${escapeHTML(t.title)}</strong><small>${escapeHTML(t.subject)} · ${escapeHTML(t.time||"Time not set")}</small></div><span class="status-pill ${t.status.replace(" ","-")}">${escapeHTML(t.status)}</span><button class="small-action" data-edit="${t.id}">Edit</button></div>`).join(""):`<div class="empty-state"><strong>No assignments for this date</strong><p>Choose another date or add a new assignment.</p></div>`);
}
function renderAll() {
  renderStats();renderDashboard();renderCalendar();renderTable();renderSelectedDate();populateSubjects();
}
function populateSubjects() {
  const select=$("subjectFilter"), previous=select.value;
  const subjects=[...new Set(tasks.map(t=>t.subject).filter(Boolean))].sort();
  select.innerHTML='<option value="all">All subjects</option>'+subjects.map(s=>`<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join("");
  select.value=subjects.includes(previous)?previous:"all";
}
function showView(view) {
  currentView=view;
  $("dashboardView").classList.toggle("hidden",!["dashboard"].includes(view));
  $("listView").classList.toggle("hidden",!["assignments","completed"].includes(view));
  $("calendarOnlyView").classList.toggle("hidden",view!=="calendar");
  $("breadcrumbCurrent").textContent=({dashboard:"Dashboard",assignments:"All Assignments",calendar:"Calendar",completed:"Completed Tasks"})[view]||"Dashboard";
  $("listViewTitle").textContent=view==="completed"?"Completed Assignments":"All Assignments";
  document.querySelectorAll(".nav-link[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  renderAll();
}
function openModal(task=null) {
  $("taskForm").reset();
  $("taskId").value=task?task.id:"";
  $("modalTitle").textContent=task?"Edit assignment":"Add assignment";
  $("taskTitle").value=task?task.title:"";
  $("taskSubject").value=task?task.subject:"";
  $("taskDate").value=task?task.date:dateKey(today);
  $("taskTime").value=task?(task.time||"17:00"):"17:00";
  $("taskPriority").value=task?task.priority:"Medium";
  $("taskStatus").value=task?task.status:"Pending";
  $("taskNotes").value=task?(task.notes||""):"";
  $("taskModal").classList.remove("hidden");
  $("taskTitle").focus();
}
function closeModal(){ $("taskModal").classList.add("hidden"); }
function toast(message) {
  const el=$("toast");el.textContent=message;el.classList.remove("hidden");
  clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.add("hidden"),2400);
}
function handleTaskSubmit(event) {
  event.preventDefault();
  const id=$("taskId").value;
  const item={id:id||makeId(),title:$("taskTitle").value.trim(),subject:$("taskSubject").value.trim(),date:$("taskDate").value,time:$("taskTime").value,priority:$("taskPriority").value,status:$("taskStatus").value,notes:$("taskNotes").value.trim()};
  if(!item.title||!item.subject||!item.date){toast("Please complete the required fields.");return;}
  if(id){tasks=tasks.map(t=>t.id===id?item:t);toast("Assignment updated.");}
  else {tasks.push(item);toast("Assignment added.");}
  saveTasks();closeModal();renderAll();
}
function handleTableAction(event) {
  const edit=event.target.closest("[data-edit]"), toggle=event.target.closest("[data-toggle]"), del=event.target.closest("[data-delete]");
  if(edit){const task=tasks.find(t=>t.id===edit.dataset.edit);if(task)openModal(task);}
  if(toggle){const task=tasks.find(t=>t.id===toggle.dataset.toggle);if(task){task.status=task.status==="Completed"?"Pending":"Completed";saveTasks();renderAll();toast(task.status==="Completed"?"Marked as completed.":"Assignment reopened.");}}
  if(del){const task=tasks.find(t=>t.id===del.dataset.delete);if(task&&confirm(`Delete "${task.title}"?`)){tasks=tasks.filter(t=>t.id!==task.id);saveTasks();renderAll();toast("Assignment deleted.");}}
}
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>showView(button.dataset.view)));
["addTaskTop","floatingAdd"].forEach(id=>$(id).addEventListener("click",()=>openModal()));
$("closeModal").addEventListener("click",closeModal);$("cancelModal").addEventListener("click",closeModal);
$("taskModal").addEventListener("click",e=>{if(e.target===$("taskModal"))closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
$("taskForm").addEventListener("submit",handleTaskSubmit);
$("allTaskRows").addEventListener("click",handleTableAction);
$("selectedDateTasks").addEventListener("click",handleTableAction);
$("subjectFilter").addEventListener("change",renderTable);$("statusFilter").addEventListener("change",renderTable);
$("searchInput").addEventListener("input",e=>{searchTerm=e.target.value.toLowerCase().trim();if(currentView==="dashboard"&&searchTerm)showView("assignments");renderTable();});
$("prevMonth").addEventListener("click",()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);renderCalendar();});
$("nextMonth").addEventListener("click",()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);renderCalendar();});
$("calendarDays").addEventListener("click",e=>{const day=e.target.closest("[data-date]");if(day){selectedDate=parseDate(day.dataset.date);renderCalendar();renderSelectedDate();if(currentView!=="calendar")showView("calendar");}});
$("notificationBtn").addEventListener("click",()=>{const count=tasks.filter(t=>t.status!=="Completed"&&daysBetween(t.date)<=1).length;toast(count?`You have ${count} assignment(s) due today or tomorrow.`:"You're all caught up!");});
$("profileBtn").addEventListener("click",()=>toast("Student profile: Himadri"));
$("settingsBtn").addEventListener("click",()=>{if(confirm("Reset all assignments and restore the sample dashboard? This cannot be undone.")){tasks=starterTasks.map(t=>({...t,id:makeId()}));saveTasks();renderAll();showView("dashboard");toast("Sample assignments restored.");}});
$("todayLabel").textContent=today.toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
renderAll();
