(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile nav toggle
  var header = document.querySelector(".site-header");
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav && header) {
    toggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll-reveal animation
  var revealTargets = document.querySelectorAll(
    ".section-kicker, .section-title, .section-intro, .fact-strip, .stat, " +
    ".skill-card, .project-card, .achv-card, .contact-card, .about-photo, .about-content"
  );
  revealTargets.forEach(function (el) { el.setAttribute("data-reveal", ""); });

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // 3D tilt on project cards
  if (!prefersReducedMotion) {
    document.querySelectorAll(".tilt-card").forEach(function (card) {
      var bounds;

      card.addEventListener("pointerenter", function () {
        bounds = card.getBoundingClientRect();
      });

      card.addEventListener("pointermove", function (e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var x = (e.clientX - bounds.left) / bounds.width - 0.5;
        var y = (e.clientY - bounds.top) / bounds.height - 0.5;
        var rotateX = (-y * 8).toFixed(2);
        var rotateY = (x * 10).toFixed(2);
        card.style.transform =
          "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
      });

      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  // Scrollspy: highlight the nav link for the section in view
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']")) : [];
  var spySections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if (spySections.length && "IntersectionObserver" in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) { link.classList.remove("active"); });
          var match = navLinks.find(function (link) {
            return link.getAttribute("href") === "#" + entry.target.id;
          });
          if (match) match.classList.add("active");
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spySections.forEach(function (section) { spyObserver.observe(section); });
  }

  // Typewriter effect cycling through roles
  var typeEl = document.getElementById("typewriter");
  var roles = [
    "Mechatronic Engineering Student",
    "Embedded Systems Tinkerer",
    "Aspiring Robotics Engineer"
  ];

  if (typeEl) {
    if (prefersReducedMotion) {
      typeEl.textContent = roles[0];
    } else {
      (function typewriterLoop(roleIndex, charIndex, deleting) {
        var current = roles[roleIndex];
        typeEl.textContent = current.slice(0, charIndex);

        var delay = deleting ? 35 : 65;
        if (!deleting && charIndex === current.length) { delay = 1600; }
        if (deleting && charIndex === 0) { delay = 300; }

        var nextChar = deleting ? charIndex - 1 : charIndex + 1;
        var nextDeleting = deleting;
        var nextRole = roleIndex;

        if (!deleting && charIndex === current.length) { nextDeleting = true; nextChar = charIndex; }
        else if (deleting && charIndex === 0) { nextDeleting = false; nextRole = (roleIndex + 1) % roles.length; nextChar = 0; }

        setTimeout(function () { typewriterLoop(nextRole, nextChar, nextDeleting); }, delay);
      })(0, 0, false);
    }
  }

  // Reveal code window lines once visible
  var codeLines = document.getElementById("code-lines");
  if (codeLines) {
    var lines = codeLines.querySelectorAll(".cl");
    var revealLines = function () {
      lines.forEach(function (line, i) {
        setTimeout(function () { line.classList.add("cl-visible"); }, prefersReducedMotion ? 0 : i * 90);
      });
    };
    if ("IntersectionObserver" in window) {
      var codeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { revealLines(); codeObserver.disconnect(); }
        });
      }, { threshold: 0.4 });
      codeObserver.observe(codeLines);
    } else {
      revealLines();
    }
  }

  // Subtle canvas cursor trail
  var canvas = document.getElementById("cursor-trail");
  if (canvas && !prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    window.addEventListener("pointermove", function (e) {
      particles.push({ x: e.clientX, y: e.clientY, life: 1 });
      if (particles.length > 40) particles.shift();
    });

    function render() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139, 92, 246, " + (p.life * 0.5) + ")";
        ctx.fill();
        p.life -= 0.035;
      });
      particles = particles.filter(function (p) { return p.life > 0; });
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  // Scroll progress bar
  var progressBar = document.getElementById("scroll-progress");
  if (progressBar) {
    var updateProgress = function () {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = pct + "%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  // Live Perth local time
  var timeEl = document.getElementById("local-time-value");
  if (timeEl) {
    var updateClock = function () {
      var formatted = new Intl.DateTimeFormat("en-AU", {
        hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Australia/Perth"
      }).format(new Date());
      timeEl.textContent = formatted;
    };
    updateClock();
    setInterval(updateClock, 30000);
  }

  // Count-up stats
  var statEls = document.querySelectorAll("[data-count-to]");
  if (statEls.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var decimals = parseInt(el.getAttribute("data-decimals"), 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = target.toFixed(decimals);
        return;
      }
      var duration = 1100;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var statObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      statEls.forEach(function (el) { statObserver.observe(el); });
    } else {
      statEls.forEach(animateCount);
    }
  }

  // Copy-to-clipboard buttons
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var reset = function () {
        btn.classList.remove("copied");
        btn.setAttribute("aria-label", btn.getAttribute("aria-label").replace("Copied", "Copy"));
      };
      var markCopied = function () {
        btn.classList.add("copied");
        var label = btn.getAttribute("aria-label");
        if (label.indexOf("Copy ") === 0) {
          btn.setAttribute("aria-label", "Copied " + label.slice(5));
        }
        setTimeout(reset, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(markCopied).catch(function () {});
      } else {
        var temp = document.createElement("textarea");
        temp.value = value;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        try { document.execCommand("copy"); markCopied(); } catch (err) {}
        document.body.removeChild(temp);
      }
    });
  });

  // Magnetic buttons
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".hero-actions .btn").forEach(function (btn) {
      btn.classList.add("magnetic");
      var strength = 0.25;

      btn.addEventListener("pointermove", function (e) {
        var b = btn.getBoundingClientRect();
        var x = (e.clientX - b.left - b.width / 2) * strength;
        var y = (e.clientY - b.top - b.height / 2) * strength;
        btn.style.transform = "translate(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px)";
      });

      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  // Spotlight tracking for cards
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".skill-card, .project-card, .achv-card, .contact-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var b = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - b.left) + "px");
        card.style.setProperty("--my", (e.clientY - b.top) + "px");
      });
    });
  }
})();
