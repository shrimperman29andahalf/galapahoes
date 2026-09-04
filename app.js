const CFG = window.TRIP_CONFIG || {};
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];

const fallback = {
  announcements: [
    {date:"SEP 18",tag:"NEW",title:"Flight info + arrival coordination",body:"Please add your arrival and departure details so we can plan airport transportation and group logistics."},
    {date:"SEP 12",tag:"ACTIVITIES",title:"Activity proposals are live!",body:"Got an excursion, dinner, beach, hike, or weird idea? Propose it and let the group decide who wants in."},
    {date:"SEP 05",tag:"FOOD",title:"Grocery plan",body:"We'll use the site for house groceries and shared meal planning as the trip gets closer."},
    {date:"AUG 28",tag:"NYE",title:"New Year's Eve plans",body:"We're looking at a group dinner + beach hangout. More details soon."}
  ],

  itinerary: [
    ["DEC 27","Arrival","Get settled, explore town, welcome dinner","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"],
    ["DEC 28","Beach + Town","Groceries, beach, relax, get bearings","https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80"],
    ["DEC 29","Into the Blue","Open for snorkeling / boat proposals","https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80"],
    ["DEC 30","Island Mode","Adventure slot / choose your own plan","https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80"],
    ["DEC 31","New Year's Eve","Group dinner + NYE plans TBD","https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80"],
    ["JAN 01","Recovery","Nothing serious before noon","https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=900&q=80"],
    ["JAN 02","Adventure","Open for a bigger excursion","https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"],
    ["JAN 03","Free Day","Pick your own adventure","https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80"],
    ["JAN 04","Last Full Day","Final beach + dinner","https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80"],
    ["JAN 05","Departure","Pack up and head home","https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=900&q=80"]
  ],

  activities: [
    {id:"A001",name:"Kicker Rock Snorkeling",date:"DEC 29 · 9:00 AM",proposer:"Mike",description:"Boat + snorkeling day. Head count will help determine whether we reserve as a group.",cost:"$120 / person",min:8,status:"Open",image:"https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1000&q=80"},
    {id:"A002",name:"Tortuga Bay Beach Day",date:"DEC 30 · 11:00 AM",proposer:"Sarah",description:"Easy beach day. Come for all of it or wander over later.",cost:"Free",min:0,status:"Open",image:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80"},
    {id:"A003",name:"Isabela Boat Trip",date:"JAN 02 · 8:00 AM",proposer:"Pablo",description:"Potential full-day boat trip. Exact pricing and timing TBD.",cost:"$90 est.",min:6,status:"Open",image:"https://images.unsplash.com/photo-1544550285-f813152fb2fd?auto=format&fit=crop&w=1000&q=80"},
    {id:"A004",name:"New Year's Eve Dinner",date:"DEC 31 · 7:00 PM",proposer:"Group",description:"Group dinner before whatever happens next.",cost:"$50 est.",min:0,status:"Open",image:"https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80"}
  ],

  signups: [
    {activityId:"A001",name:"Pablo",status:"Going",people:1},
    {activityId:"A001",name:"Mike",status:"Going",people:2},
    {activityId:"A001",name:"Sara",status:"Maybe",people:1},
    {activityId:"A002",name:"Pablo",status:"Going",people:1},
    {activityId:"A002",name:"Sara",status:"Going",people:1},
    {activityId:"A003",name:"Pablo",status:"Going",people:1},
    {activityId:"A003",name:"Jordan",status:"Maybe",people:2},
    {activityId:"A004",name:"Pablo",status:"Going",people:1},
    {activityId:"A004",name:"Mike",status:"Going",people:2},
    {activityId:"A004",name:"Sara",status:"Maybe",people:1}
  ],

  crew: [
    {name:"Pablo",note:"Organizer"},
    {name:"Mike",note:"Going"},
    {name:"Sara",note:"Going"},
    {name:"Jordan",note:"Going"},
    {name:"Alex",note:"Going"}
  ],

  flights: [
    {name:"Pablo",arrival:"Dec 27 · TBD",arrivalFlight:"TBD",departure:"Jan 5 · TBD",departureFlight:"TBD"}
  ]
};

let state = JSON.parse(JSON.stringify(fallback));

function csvToObjects(text){
  const rows=[]; let row=[],cell="",quote=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(c=='"'&&quote&&n=='"'){cell+='"';i++}
    else if(c=='"')quote=!quote;
    else if(c==','&&!quote){row.push(cell);cell=""}
    else if((c=='\n'||c=='\r')&&!quote){
      if(c=='\r'&&n=='\n')i++;
      row.push(cell);cell="";
      if(row.some(x=>x.trim()!==""))rows.push(row);
      row=[];
    } else cell+=c;
  }
  if(cell||row.length){row.push(cell);rows.push(row)}
  if(rows.length<2)return [];
  const h=rows[0].map(x=>x.trim());
  return rows.slice(1).map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]||"").trim()])));
}

async function loadCsv(url){
  if(!url)return null;
  const res=await fetch(url,{cache:"no-store"});
  if(!res.ok)throw new Error("CSV load failed");
  return csvToObjects(await res.text());
}

async function loadData(){
  try{
    const d=CFG.data||{};
    const [a,acts,sups,c,f]=await Promise.all([
      loadCsv(d.announcementsCsv),
      loadCsv(d.activitiesCsv),
      loadCsv(d.signupsCsv),
      loadCsv(d.crewCsv),
      loadCsv(d.flightsCsv)
    ]);

    if(a?.length){
      state.announcements=a.map(x=>({
        date:x.Date||x.date,
        tag:x.Tag||x.tag||"UPDATE",
        title:x.Title||x.title,
        body:x.Body||x.body
      }));
    }

    if(acts?.length){
      state.activities=acts
        .filter(x=>(x.Approved||x.approved||"YES").toUpperCase()!=="NO")
        .map(x=>({
          id:x.ID||x.id,
          name:x.Activity||x.activity,
          date:[x.Date||x.date,x.Time||x.time].filter(Boolean).join(" · "),
          proposer:x.ProposedBy||x["Proposed By"]||x.proposer||"",
          description:x.Description||x.description||"",
          cost:x.Cost||x.cost||"TBD",
          min:Number(x.Minimum||x.minimum||0),
          status:x.Status||x.status||"Open",
          image:x.Image||x.image||fallback.activities[0].image
        }));
    }

    if(sups?.length){
      state.signups=sups.map(x=>({
        activityId:x.ActivityID||x["Activity ID"]||x.activityId,
        name:x.Name||x.name,
        status:x.Status||x.status||"Going",
        people:Number(x.People||x.people||1)
      }));
    }

    if(c?.length){
      state.crew=c.map(x=>({
        name:x.Name||x.name,
        note:x.Note||x.note||"Going"
      }));
    }

    if(f?.length){
      state.flights=f.map(x=>({
        name:x.Name||x.name,
        arrival:x.Arrival||x.arrival,
        arrivalFlight:x.ArrivalFlight||x["Arrival Flight"]||"",
        departure:x.Departure||x.departure,
        departureFlight:x.DepartureFlight||x["Departure Flight"]||""
      }));
    }

  }catch(err){
    console.warn("Using sample data:",err);
  }

  renderAll();
}

function countFor(id,status){
  return state.signups
    .filter(s=>s.activityId===id && s.status.toLowerCase()===status.toLowerCase())
    .reduce((a,s)=>a+(Number(s.people)||1),0);
}

function renderAnnouncements(){
  $("#announcementList").innerHTML=state.announcements.map((x,i)=>`
    <article class="announcement">
      <div class="meta">
        <span class="${i===0?"badge":""}">${x.tag}</span>
        <span>${x.date}</span>
      </div>
      <h3>${x.title}</h3>
      <p>${x.body}</p>
    </article>
  `).join("");
}

function renderItinerary(){
  $("#itineraryGrid").innerHTML=state.itinerary.map(x=>`
    <article class="day-card">
      <div class="image" style="background-image:url('${x[3]}')"></div>
      <div class="body">
        <small>${x[0]}</small>
        <h3>${x[1]}</h3>
        <p>${x[2]}</p>
      </div>
    </article>
  `).join("");
}

function renderActivities(filter="all"){
  let acts=state.activities;

  if(filter==="open") acts=acts.filter(x=>x.status.toLowerCase()==="open");
  if(filter==="free") acts=acts.filter(x=>/free|\$0/i.test(x.cost));
  if(filter==="paid") acts=acts.filter(x=>!/free|\$0/i.test(x.cost));

  $("#activityCount").textContent=acts.length;

  $("#activityGrid").innerHTML=acts.map(x=>{
    const going=countFor(x.id,"Going");
    const maybe=countFor(x.id,"Maybe");

    return `
      <article class="activity-card">
        <div class="activity-img" style="background-image:url('${x.image}')"></div>

        <div class="activity-body">
          <div class="activity-top">
            <div>
              <div class="activity-date">${x.date}</div>
              <h3>${x.name}</h3>
            </div>
            <div class="activity-cost">${x.cost}</div>
          </div>

          <p class="activity-desc">${x.description}</p>

          <div class="activity-meta">
            <span>Proposed by ${x.proposer||"the group"}</span>
            <span>${x.min?`Min. ${x.min}`:"Open group"}</span>
          </div>

          <div class="activity-meta">
            <strong>👥 ${going} going</strong>
            <span>${maybe} maybe</span>
          </div>

          <div class="activity-actions">
            <button class="going" onclick="openSignup('${x.id}','${escapeAttr(x.name)}','Going')">I'm in</button>
            <button onclick="openSignup('${x.id}','${escapeAttr(x.name)}','Maybe')">Maybe</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function escapeAttr(s){
  return String(s).replaceAll("'","&#39;");
}

function initials(name){
  return name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
}

function renderCrew(){
  $("#crewGrid").innerHTML=state.crew.map(x=>`
    <article class="crew-card">
      <div class="initials">${initials(x.name)}</div>
      <h3>${x.name}</h3>
      <p>${x.note||"Going"}</p>
    </article>
  `).join("");
}

function renderFlights(){
  $("#flightTableBody").innerHTML=state.flights.map(x=>`
    <tr>
      <td>${x.name}</td>
      <td>${x.arrival||"—"}</td>
      <td>${x.arrivalFlight||"—"}</td>
      <td>${x.departure||"—"}</td>
      <td>${x.departureFlight||"—"}</td>
    </tr>
  `).join("") || `<tr><td colspan="5">No flight information yet.</td></tr>`;
}

function renderAll(){
  renderAnnouncements();
  renderItinerary();
  renderActivities();
  renderCrew();
  renderFlights();
}

function countdown(){
  const start=new Date(CFG.trip?.startDate||"2026-12-27T00:00:00");
  const days=Math.max(0,Math.ceil((start-new Date())/86400000));
  $("#daysToGo").textContent=days;
}

const modal=$("#modalBackdrop");
const body=$("#modalBody");
const title=$("#modalTitle");
const eyebrow=$("#modalEyebrow");

function openModal(kind, extra={}){
  const forms=CFG.forms||{};
  let label="",url="";

  if(kind==="proposal"){
    label="ACTIVITY";
    title.textContent="Propose an activity";
    url=forms.activityProposal;
  }

  if(kind==="crew"){
    label="CREW";
    title.textContent="Add / update my info";
    url=forms.crew;
  }

  if(kind==="flight"){
    label="FLIGHTS";
    title.textContent="Add my flight info";
    url=forms.flight;
  }

  if(kind==="signup"){
    label="ACTIVITY SIGN-UP";
    title.textContent=`${extra.status}: ${extra.name}`;
    url=forms.activitySignup;

    if(url && CFG.signupActivityEntry){
      const joiner=url.includes("?")?"&":"?";
      url+=`${joiner}${encodeURIComponent(CFG.signupActivityEntry)}=${encodeURIComponent(extra.id)}&usp=pp_url`;
    }
  }

  eyebrow.textContent=label;

  if(url){
    body.innerHTML=`
      <div class="form-fallback">
        <p>This opens the Google Form in a new tab. No extra app is required.</p>
        <a class="btn primary form-link" href="${url}" target="_blank" rel="noopener">Open form →</a>
        ${kind==="signup"?`<p><small>Activity ID: <b>${extra.id}</b> · Choose <b>${extra.status}</b> on the form.</small></p>`:""}
      </div>
    `;
  } else {
    body.innerHTML=`
      <div class="form-fallback">
        <b>This form isn't connected yet.</b>
        <p>Create the Google Form, then paste its public link into <code>config.js</code> under <b>forms</b>.</p>
        ${kind==="signup"?`<p>For this activity, the ID is <b>${extra.id}</b>.</p>`:""}
      </div>
    `;
  }

  modal.hidden=false;
  document.body.style.overflow="hidden";
}

function closeModal(){
  modal.hidden=true;
  document.body.style.overflow="";
}

window.openSignup=(id,name,status)=>openModal("signup",{id,name,status});

$$("[data-form]").forEach(b=>b.addEventListener("click",()=>openModal(b.dataset.form)));

$("#modalClose").addEventListener("click",closeModal);

modal.addEventListener("click",e=>{
  if(e.target===modal) closeModal();
});

$("#menuButton").addEventListener("click",()=>{
  $("#mobileMenu").classList.toggle("open");
});

$$(".mobile-menu a").forEach(a=>a.addEventListener("click",()=>{
  $("#mobileMenu").classList.remove("open");
}));

$$("#activityFilters button").forEach(b=>b.addEventListener("click",()=>{
  $$("#activityFilters button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
  renderActivities(b.dataset.filter);
}));

countdown();
loadData();
