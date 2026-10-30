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
    el.innerHTML = ds.map(function(d){return '<div class="card"><h3>'+esc(d.t)+'</h3><div class="diagram-frame"><figure><img class="gallery-thumb" src="assets/svg/'+esc(d.f)+'" alt="'+esc(d.t)+'" loading="lazy" data-full="assets/svg/'+esc(d.f)+'"/><figcaption>'+esc(d.f)+' &mdash; click to expand</figcaption></figure></div></div>';}).join("");
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


  // ---- Reality Engine (interactive node graph) ----
  var ENGINE = {
    nodes: {},
    edges: [],
    svg: null, detail: null, selected: null,
    view: 'combined', ox: 0, oy: 0, scale: 1
  };
  function layoutNodes(nodes){
    // fixed spatial layout (manual, meaningful: individual->collective left->right, layers top->bottom)
    var pos = {
      belief:[80,60], probable:[240,150], selection:[240,340],
      handoff:[400,340], unconscious:[400,240], actuality:[600,340],
      experience:[760,340], collective:[600,80], attraction:[400,80],
      arbitration:[500,460]
    };
    nodes.forEach(function(n){ n.x = pos[n.id] ? pos[n.id][0] : 300; n.y = pos[n.id] ? pos[n.id][1] : 260; });
    return nodes;
  }
  function renderEngine(){
    var el = document.getElementById('engine-body'); if(!el||!DATA||!DATA.realityEngine) return;
    var r = DATA.realityEngine;
    layoutNodes(r.nodes);
    var nodes = r.nodes.filter(function(n){ return ENGINE.view==='combined' || n.layer===ENGINE.view; });
    var ids = {}; nodes.forEach(function(n){ ids[n.id]=1; });
    var edges = r.connections.filter(function(c){ return ids[c.from] && ids[c.to]; });

    var w=1000, h=460;
    var ns = 'http://www.w3.org/2000/svg';
    var s = '<div class="engine-wrap">';
    s += '<div class="engine-toolbar">'
      +'<button data-view="combined" class="active">Combined</button>'
      +'<button data-view="individual">Individual</button>'
      +'<button data-view="collective">Collective</button>'
      +'<button data-action="reset">Reset view</button>'
      +'</div>';
    s += '<svg id="engine-canvas" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid meet">';
    // edges
    edges.forEach(function(e){
      var a=null,b=null; nodes.forEach(function(n){ if(n.id===e.from)a=n; if(n.id===e.to)b=n; });
      if(!a||!b)return;
      var cls = e.status==='solid'?'solid':(e.status==='inferred'?'inferred':(e.status==='annotation'?'annotation':'question'));
      s += '<line class="engine-edge '+cls+'" data-edge="'+e.from+'->'+e.to+'" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" marker-end=""/>';
    });
    // nodes
    nodes.forEach(function(n){
      if(n.id==='arbitration'||n.empty){
        s += '<g class="engine-node" data-node="'+n.id+'" transform="translate('+n.x+','+n.y+')">'
          +'<circle r="34" fill="none" stroke="#ff6b8b" stroke-width="2.5" stroke-dasharray="7 5"/>'
          +'<circle r="34" fill="none" stroke="rgba(255,107,139,.25)" stroke-width="9"/>'
          +'<text y="-2" text-anchor="middle" font-size="30" fill="#ff6b8b" font-weight="700">?</text>'
          +'<text y="46" text-anchor="middle" font-size="9" fill="#66718c">combining rule</text>'
          +'</g>';
      } else {
        var fill = n.status==='question'?'#ff6b8b':(n.status==='annotation'?'#56d4f0':(n.status==='asserted'?'#e5c07b':'#49d3a3'));
        s += '<g class="engine-node" data-node="'+n.id+'" transform="translate('+n.x+','+n.y+')">'
          +'<circle r="18" fill="'+fill+'" stroke="#05070d" stroke-width="2"/>'
          +'<text y="26" text-anchor="middle">'+n.label+'</text>'
          +'</g>';
      }
    });
    s += '</svg>';
    s += '<div class="engine-detail" id="engine-detail"><div class="empty-slate">Click a node or connection.</div></div>';
    s += '</div>';
    el.innerHTML = s;

    // interactions
    var svg = el.querySelector('#engine-canvas');
    var detail = el.querySelector('#engine-detail');
    ENGINE.svg = svg; ENGINE.detail = detail;
    el.querySelectorAll('.engine-node').forEach(function(g){
      g.addEventListener('click', function(){
        var id = g.getAttribute('data-node');
        var n = null; r.nodes.forEach(function(x){ if(x.id===id)n=x; });
        detail.innerHTML = '<h4>'+n.label+'</h4><p>'+n.desc+'</p>'+(n.annotation?'<div class="quote">'+n.annotation+'</div>':'')+'<span class="offset">'+n.evidence+'</span>'
          +(n.status?'<div class="meta">status: '+n.status+'</div>':'');
      });
    });
    el.querySelectorAll('.engine-edge').forEach(function(l){
      l.addEventListener('click', function(){
        var key = l.getAttribute('data-edge');
        var e = null; r.connections.forEach(function(x){ if((x.from+'->'+x.to)===key)e=x; });
        var st = e.status==='solid'?'explicit (quoted)':(e.status==='inferred'?'inferred':'unresolved');
        detail.innerHTML = '<h4>Connection</h4><p class="mono">'+key+'</p><p>'+st+'</p><div class="quote">'+e.evidence+'</div>';
      });
    });
    // view buttons
    el.querySelectorAll('.engine-toolbar button[data-view]').forEach(function(b){
      b.addEventListener('click', function(){
        ENGINE.view = b.getAttribute('data-view');
        el.querySelectorAll('.engine-toolbar button').forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        renderEngine();
      });
    });
    el.querySelectorAll('.engine-toolbar button[data-action]').forEach(function(b){
      b.addEventListener('click', function(){ renderEngine(); });
    });
    // --- pan / zoom / keyboard ---
    var vb = { x:0, y:0, w:1000, h:460 };
    svg.viewBox.baseVal.x = vb.x; svg.viewBox.baseVal.y = vb.y; svg.viewBox.baseVal.width = vb.w; svg.viewBox.baseVal.height = vb.h;
    var redrawVB = function(){ svg.setAttribute("viewBox", vb.x+" "+vb.y+" "+vb.w+" "+vb.h); };
    // wheel zoom
    svg.addEventListener("wheel", function(e){
      e.preventDefault();
      var f = e.deltaY < 0 ? 0.9 : 1.1;
      var nw = vb.w * f; var nh = vb.h * f;
      if(nw < 200 || nw > 4000) return;
      vb.w = nw; vb.h = nh; redrawVB();
    }, { passive:false });
    // drag pan
    var dragging=false, sx=0, sy=0;
    svg.addEventListener("pointerdown", function(e){ dragging=true; sx=e.clientX; sy=e.clientY; svg.classList.add("dragging"); });
    window.addEventListener("pointermove", function(e){ if(!dragging) return; var k=vb.w/1000; vb.x -= (e.clientX-sx)/k; vb.y -= (e.clientY-sy)/k; sx=e.clientX; sy=e.clientY; redrawVB(); });
    window.addEventListener("pointerup", function(){ dragging=false; svg.classList.remove("dragging"); });
    // focus-on-selection: re-center on node
    function focusNode(n){ vb.x = n.x - vb.w/2; vb.y = n.y - vb.h/2; redrawVB(); }
    // keyboard
    svg.setAttribute("tabindex","0");
    svg.addEventListener("keydown", function(e){
      if(e.key==="+"||e.key==="="){ vb.w*=0.9; vb.h*=0.9; redrawVB(); e.preventDefault(); }
      else if(e.key==="-"){ vb.w*=1.1; vb.h*=1.1; redrawVB(); e.preventDefault(); }
      else if(e.key==="ArrowLeft"){ vb.x-=20; redrawVB(); e.preventDefault(); }
      else if(e.key==="ArrowRight"){ vb.x+=20; redrawVB(); e.preventDefault(); }
      else if(e.key==="ArrowUp"){ vb.y-=20; redrawVB(); e.preventDefault(); }
      else if(e.key==="ArrowDown"){ vb.y+=20; redrawVB(); e.preventDefault(); }
      else if(e.key==="0"||e.key==="r"){ vb.x=0; vb.y=0; vb.w=1000; vb.h=460; redrawVB(); e.preventDefault(); }
    });
    // hook node clicks to focus
    el.querySelectorAll(".engine-node").forEach(function(g){
      g.addEventListener("click", function(){ var id=g.getAttribute("data-node"); var n=null; r.nodes.forEach(function(x){ if(x.id===id) n=x; }); if(n) focusNode(n); });
    });
    // reduced motion: disable transitions if preferred (our graph has none, but keep the class for consistency)
    var rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    if(rm && rm.matches){ svg.style.transition="none"; }
  }



  function renderMystery(){
    var el=document.getElementById("mystery-body"); if(!el||!DATA||!DATA.mysteryMap) return;
    var mm=DATA.mysteryMap;
    var qs=mm.questions;
    var html = "<div class=\"grid cols-2\">";
    qs.forEach(function(q){
      var central = q.id===mm.central;
      var deps = q.dependsOn && q.dependsOn.length ? q.dependsOn.map(function(x){return "<span class=\"pill inferred\">"+esc(x)+"</span>";}).join(" ") : "<span class=\"empty-slate\">no upstream dependencies</span>";
      html += "<div class=\"card\""+(central?" style=\"border-color:var(--bad)\"":"")+">"+
        "<h3>"+(central?"<span class=\"status-dot bad\"></span>":"")+esc(q.label)+"</h3>"+
        "<p><strong>Known:</strong> "+esc(q.known)+"</p>"+
        "<p><strong>Missing:</strong> "+esc(q.missing)+"</p>"+
        "<p><strong>Evidence:</strong> <span class=\"offset\">"+esc(q.evidence)+"</span></p>"+
        "<div class=\"meta\">depends on: "+deps+"</div>"+
        "</div>";
    });
    html += "</div>";
    el.innerHTML = html;
  }


  // ---- Immersive opening: four-beat sequence ----
  function wireOpening(){
    var stage = document.getElementById("opening-stage"); if(!stage) return;
    var beats = stage.querySelectorAll(".beat");
    var counter = document.getElementById("opening-counter");
    var prev = document.getElementById("opening-prev");
    var next = document.getElementById("opening-next");
    var i = 0;
    function show(n){
      i = Math.max(0, Math.min(beats.length-1, n));
      beats.forEach(function(b, idx){ b.hidden = (idx !== i); });
      if(counter) counter.textContent = (i+1) + " / " + beats.length;
      // re-trigger empty-appear animation on beat 3
      var empty = stage.querySelector(".beat-empty");
      if(empty && i===2){ empty.style.animation = "none"; void empty.offsetWidth; empty.style.animation = ""; }
      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if(reduced){ // show all beats statically stacked? No — show current beat only, no motion needed
      }
    }
    if(next) next.addEventListener("click", function(){ show(i+1); });
    if(prev) prev.addEventListener("click", function(){ show(i-1); });
    show(0);
  }


  document.addEventListener("DOMContentLoaded", function(){
    fetch(DATA_URL).then(function(r){return r.json();}).then(function(d){
      DATA = d;
      wireOpening();
    renderDashboard(); renderRobbery(); renderEngine(); renderMystery(); renderEvidence();
    renderGallery(); wireObservatory(); renderCorrections(); renderQuestions(); renderTimeline(); wireTabs();
    }).catch(function(e){ console.error("data load failed", e); });
  });

})());