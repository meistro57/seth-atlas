((function(){
  "use strict";
  var DATA = null;
  var DATA_URL = "assets/data/research.json";

  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]; }); }

  function pillFor(i){
    var k = String(i||"explicit").toLowerCase();
    var map = {explicit:"explicit",inferred:"inferred",annotation:"annotation",negative:"negative",asserted:"asserted"};
    var cls = map[k] || "explicit";
    return '<span class="pill '+cls+'">'+esc(i||cls)+'</span>';
  }
  function statusDot(s){
    if(s==="negative"||s==="asserted-only"||s==="provisional-single-passage") return '<span class="status-dot warn"></span>';
    if(s==="annotation"||s==="open"||s==="unexamined-in-source") return '<span class="status-dot warn"></span>';
    return '<span class="status-dot good"></span>';
  }
  function modelBadge(m){
    var c = String(m||"").split("-")[0].trim();
    if(!c) return "";
    var ch = c[0].toUpperCase();
    var cls = ({"A":"A","B":"B","C":"C","D":"D"}[ch])||"D";
    return '<span class="model-badge '+cls+'">'+esc(m)+'</span>';
  }

  function renderDashboard(){
    var el = document.getElementById("dashboard"); if(!el||!DATA) return;
    var t = DATA.timeline.length-1;
    var latest = DATA.timeline[t];
    var open = DATA.openQuestions.filter(function(q){return q.status==="open"||q.status==="unexamined-in-source";}).length;
    el.innerHTML =
      '<div class="grid cols-4">'+
      '<div class="card"><div class="meta">latest phase</div><h3>Phase '+latest.phase+'</h3><p>'+esc(latest.finding)+'</p></div>'+
      '<div class="card"><div class="meta">claims</div><h3>'+DATA.claims.length+'</h3><p>verified passages, offset-anchored</p></div>'+
      '<div class="card"><div class="meta">open questions</div><h3>'+open+'</h3><p>unresolved interfaces</p></div>'+
      '<div class="card"><div class="meta">retractions</div><h3>'+DATA.corrections.length+'</h3><p>recorded, not hidden</p></div>'+
      '</div>'+
      '<div class="callout good">Current headline: '+esc(latest.finding)+'</div>';
  }

  function renderEvidence(){
    var el = document.getElementById("evidence-body"); if(!el||!DATA) return;
    var q = document.getElementById("ev-search"); var f = document.getElementById("ev-filter");
    function draw(){
      var query = (q&&q.value||"").toLowerCase(); var filt = f&&f.value||"";
      var rows = DATA.claims.filter(function(c){
        var mq = !query || c.claim.toLowerCase().indexOf(query)>=0 || c.text.toLowerCase().indexOf(query)>=0 || String(c.offset).indexOf(query)>=0;
        var mf = !filt || c.interpretation===filt || c.status===filt;
        return mq && mf;
      });
      if(!rows.length){ el.innerHTML='<div class="empty-slate">No matching claims.</div>'; return; }
      el.innerHTML = '<table><thead><tr><th>@offset</th><th>Claim</th><th>Conf</th><th>Models</th><th>Standing</th><th>Quote</th></tr></thead><tbody>'+
        rows.map(function(c){
          return '<tr><td class="offset">'+esc(c.offset)+'</td><td>'+statusDot(c.status)+esc(c.claim)+'</td><td>'+esc(c.confidence||"")+'</td><td>'+(c.models||[]).map(modelBadge).join(" ")+'</td><td>'+pillFor(c.interpretation)+'</td><td><div class="quote">'+esc(c.text)+'</div></td></tr>';
        }).join("")+'</tbody></table>';
    }
    if(q) q.addEventListener("input", draw);
    if(f) f.addEventListener("change", draw);
    draw();
  }

  function renderCorrections(){
    var el=document.getElementById("corrections"); if(!el||!DATA) return;
    el.innerHTML = DATA.corrections.map(function(c){return '<div class="correction"><span class="when">'+esc(c.when)+'</span> &mdash; '+esc(c.what)+'</div>';}).join("");
  }

  function renderQuestions(){
    var el=document.getElementById("questions"); if(!el||!DATA) return;
    el.innerHTML = DATA.openQuestions.map(function(q){
      var dot = q.status==="answered" ? "good" : (q.status==="open" ? "warn" : "bad");
      var ans = q.status==="answered" ? '<div class="quote">'+esc(q.answer||"")+'</div>' : '<div class="quote">'+(q.status==="unexamined-in-source"?"unexamined in source":esc(q.status))+'</div>';
      var evid = (q.evidence||[]).map(function(e){return '<span class="offset">'+esc(e)+'</span>';}).join(", ");
      return '<div class="card"><h3>'+dot+' '+esc(q.question)+'</h3>'+ans+(evid?'<div class="meta">evidence: '+evid+'</div>':"")+'</div>';
    }).join("");
  }

  function renderTimeline(){
    var el=document.getElementById("timeline"); if(!el||!DATA) return;
    el.innerHTML = DATA.timeline.map(function(t){return '<div class="card"><div class="meta">Phase '+t.phase+'</div><h3>'+esc(t.title)+'</h3><p>'+esc(t.finding)+'</p></div>';}).join("");
  }

  function renderGallery(){
    var el=document.getElementById("gallery"); if(!el) return;
    var ds=[
      {f:"flowchart.svg",t:"Belief to selection to actuality"},
      {f:"concept_map.svg",t:"Concept map"},
      {f:"shared_reality.svg",t:"Shared-reality (fork declared)"},
      {f:"p2_comparison.svg",t:"Individual vs collective opacity"},
      {f:"p2_contradictions.svg",t:"Contradictions map"},
      {f:"p3_models.svg",t:"Three models A B C"},
      {f:"p3_fault_tree.svg",t:"Fault tree"},
      {f:"p3_decision.svg",t:"Shared-event decision"},
      {f:"p4_decision_tree.svg",t:"Event vs experience decision"},
      {f:"p4_shared_event.svg",t:"Updated shared event"}
    ];
    el.innerHTML = ds.map(function(d){return '<div class="card"><h3>'+esc(d.t)+'</h3><div class="diagram-frame"><figure><img src="assets/svg/'+esc(d.f)+'" alt="'+esc(d.t)+'" loading="lazy"/><figcaption>'+esc(d.f)+'</figcaption></figure></div></div>';}).join("");
  }

  var MODELS = {
    "A": { color:"A", name:"Model A - collective construction", verdict:"FAIL (as shared-event claim)",
      claim:"Individual expectations combine to produce shared physical events.",
      support:"30004 - world is materialisation en masse of individual expectations (asserted OUTCOME, not operated).",
      against:"No passage shows expectations combining. 261494 is one person, one event. No summation rule exists anywhere examined.",
      status:"Asserted at scale, never operated." },
    "B": { color:"B", name:"Model B - individual selection", verdict:"FAIL (pure form)",
      claim:"Shared conditions exist; belief selects which probable each person experiences.",
      support:"728379 - choose happenings physically materialized; 693302 screening; 31690 accord.",
      against:"728379 says actuality, not perception. The shared-condition premise is never stated; it is our inference.",
      status:"Most natural reading, least evidenced." },
    "C": { color:"C", name:"Model C - layered process", verdict:"PROVISIONAL, ACCOMMODATES-ONLY",
      claim:"Personal selection, unconscious actualisation, collective conditions interact through different operations.",
      support:"772425 stages; 483387; 490895; 30004; 649003 - four claims, four objects.",
      against:"Nothing connects the layers; every interface unwired. Survives by being empty.",
      status:"Provisional, accommodates-only — survives by being empty, not by being evidenced." },
    "D": { color:"D", name:"Phase 4 - event vs experience", verdict:"D-WEAK — text never instates the A/B distinction",
      claim:"Does belief change the event, the experience, both, or is the distinction refused?",
      support:"728379 victim/robber: one attracts, the other constitutively present, second party's selection UNADDRESSED. 261494 refusal (but); 969795 one reality, uniquely experienced.",
      against:"The distinction is refused, not answered. No passage places two competing selectors in one causal sentence.",
      status:"Weak — single worked example, second party unexamined; whether doctrine or underdetermination is not settled." }
  };

  function renderModel(name){
    var el=document.getElementById("model-panel"); if(!el) return;
    var m=MODELS[name]; if(!m) return;
    el.innerHTML = '<h3>'+modelBadge(m.color)+' '+esc(m.name)+'</h3>'
      +'<div class="callout">Verdict: '+esc(m.verdict)+'</div>'
      +'<p><strong>Hypothesis (ours):</strong> '+esc(m.claim)+'</p>'
      +'<p><strong>What the text does NOT support:</strong> '+esc(m.against)+'</p>' + '<p><strong>What the text supports:</strong> '+esc(m.support)+'</p>'
      +'<p><strong>Standing:</strong> '+esc(m.status)+'</p>';
  }

  function wireTabs(){
    var tabs = document.querySelectorAll("#model-tabs button");
    tabs.forEach(function(b){
      b.addEventListener("click", function(){
        tabs.forEach(function(x){ x.setAttribute("aria-selected","false"); x.classList.remove("active"); });
        b.setAttribute("aria-selected","true"); b.classList.add("active");
        renderModel(b.getAttribute("data-model"));
      });
    });
    renderModel("A");
  }


  function renderRobbery(){
    var el=document.getElementById("robbery-body"); if(!el||!DATA||!DATA.robbery) return;
    var r=DATA.robbery;
    function list(items){ return "<ul>"+items.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul>"; }
    el.innerHTML =
      "<div class=\"card\"><h3>"+esc(r.title)+" <span class=\"offset\">"+esc(r.source)+"</span></h3><p>"+esc(r.description)+"</p></div>"+
      "<div class=\"callout\"><strong>Safeguard (read first):</strong>"+esc(r.safeguard)+"</div>"+
      "<div class=\"grid cols-3\">"+
      "<div class=\"card\"><h4>What the text establishes</h4>"+list(r.whatTheTextEstablishes)+"</div>"+
      "<div class=\"card\"><h4>What investigators infer</h4>"+list(r.whatInvestigatorsInfer)+"</div>"+
      "<div class=\"card\"><h4>What remains unanswered</h4>"+list(r.whatRemainsUnanswered)+"</div>"+
      "</div>"+
      "<div class=\"callout warn\"><strong>Unexamined, not assigned:</strong> "+esc(r.unexaminedLabel)+"</div>"+
      "<div class=\"callout\"><strong>Safeguard:</strong> "+esc(r.safeguard)+"</div>";
  }

  document.addEventListener("DOMContentLoaded", function(){
    fetch(DATA_URL).then(function(r){return r.json();}).then(function(d){
      DATA = d;
      renderDashboard(); renderRobbery(); renderEvidence(); renderCorrections(); renderQuestions(); renderTimeline(); renderGallery(); wireTabs();
    }).catch(function(e){ console.error("data load failed", e); });
  });

})());