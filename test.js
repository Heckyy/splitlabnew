var DealinOnlineForm = (function (t) {
  "use strict";
  var e = "https://api.dealin.id/public/get_channel_by_code?code=",
    i = "https://api.dealin.id/public/submit_external_lead?code=";
  class a {
    constructor(t = {}) {
      (this.prefix = "dealinid-"),
        (this.isHit = !1),
        (this.scriptId = t.scriptId || this.prefix + "script"),
        (this.scriptEl = document.getElementById(this.scriptId)),
        (this.defaultCode =
          t.defaultCode || this.scriptEl.getAttribute("data-code")),
        (this.formId = t.formId || this.prefix + "form-" + this.defaultCode),
        (this.formEl = null),
        (this.formInputEl = {}),
        (this.handle = t.handle || !0),
        this.scriptEl.getAttribute("data-handle") &&
          (this.handle = "true" === this.scriptEl.getAttribute("data-handle")),
        (this.silent = t.silent || !1),
        this.scriptEl.getAttribute("data-silent") &&
          (this.silent = "true" === this.scriptEl.getAttribute("data-silent"));
    }
    async init() {
      this.isHit = this.checkIsHit();
      var t = this.getUniqueCode(),
        e = await this.getChannelDetail(t),
        i = this.findForm(e && e.form && e.form.fields);
      (this.formEl = i.form), (this.formInputEl = i.fields);
      var a = [];
      this.parseInput(e && e.form && e.form.fields, !1, (t) => a.push(t)),
        a.length > 0 && r("canot find field listed bellow: \n" + a.join(", ")),
        this.addFormSubmitEvent(e);
    }
    highlightInput() {
      this.formEl.setAttribute("style", "border: 2px solid red;"),
        Object.entries(this.formInputEl).forEach(([t, e]) => {
          e.setAttribute("title", t),
            e.setAttribute("style", "background:yellow");
        });
    }
    addFormSubmitEvent(t) {
      this.formEl && !this.formEl.getAttribute("data-dealin-event")
        ? (this.formEl.setAttribute("data-dealin-event", "submit"),
          r("watching submit on form#" + this.formEl.id, !0),
          null != this.formEl &&
            this.formEl.addEventListener("submit", (e) => {
              e.preventDefault();
              var a = [],
                n = [],
                s = this.parseInput(
                  t.form.fields,
                  !0,
                  (t) => a.push(t),
                  (t) => n.push(t)
                );
              a.length < 1 && n.length < 1
                ? this.callAPI("post", i + this.getUniqueCode(), s)
                    .then((e) => {
                      this.silent ||
                        alert(
                          "Terimakasih sudah menghubungi kami!\nRepresentative kami akan segera menghubungi anda!"
                        ),
                        this.handle
                          ? t.redirectUrl
                            ? (window.location.href = t.redirectUrl)
                            : window.location.reload()
                          : this.formEl.submit();
                    })
                    .catch((t) => {
                      this.silent ||
                        alert(
                          "Permintaan anda gagal di proses, silahkan coba beberapa saat lagi!"
                        ),
                        r(t.statusText, this.silent);
                    })
                : (a.length > 0 &&
                    r(
                      "canot find field listed bellow: \n" + a.join(", "),
                      this.silent
                    ),
                  n.length > 0 &&
                    r("validation error: \n" + n.join("\n"), this.silent));
            }))
        : r("already watching submit on form#" + this.formEl.id, !0);
    }
    parseInput(t, e, i, a) {
      var r = {},
        s = this.formInputEl,
        l = new n();
      return (
        null != t &&
          Object.entries(t).forEach(([t, n]) => {
            var o = s[n.name];
            if (o) {
              var d = o.value;
              if (e) {
                var h = l.doValidate(d, n);
                a && h && a(h);
              }
              "date" == n.type && (d = Date.parse(d)), (r[n.name] = d);
            } else i && i(n.name);
          }),
        r
      );
    }
    findInput(t, e) {
      var i = ["input", "select", "textarea"].join(","),
        a = t.querySelectorAll(i),
        n = {};
      return (
        null != e &&
          e.forEach((t) => {
            var e =
                "(" +
                t.alias
                  .split(",")
                  .map((t) => t.trim())
                  .join("|") +
                ")",
              i = RegExp(e),
              r = !1;
            a.forEach((e) => {
              r ||
                ((r = i.test(
                  (e.id + "-" + e.name + "-" + e.placeholder).toLowerCase()
                )) &&
                  (n[t.name] = e));
            });
          }),
        n
      );
    }
    findForm(t) {
      var e = document.querySelectorAll("#" + this.formId);
      e.length < 1 && (e = document.querySelectorAll("form"));
      var i = null,
        a = {},
        n = this;
      return (
        e.forEach((e) => {
          var r = n.findInput(e, t);
          Object.keys(r).length > Object.keys(a).length && ((i = e), (a = r));
        }),
        { form: i, fields: a }
      );
    }
    getUniqueCode() {
      return this.getParam("dealinc") || this.getParam("c") || this.defaultCode;
    }
    async getChannelDetail(t) {
      var i,
        a = this.prefix + t;
      if ((this.isHit || (i = this.getData(a)), !i)) {
        var n = this;
        await this.callAPI("get", e + t + (this.isHit ? "&hit=true" : ""))
          .then(function (t) {
            var e = null;
            t[0] && (e = t[0]), n.saveData(a, e), (i = e);
          })
          .catch(function (t) {
            404 == t.status
              ? r("channel unique code not found", n.silent)
              : r("there is connection issue to dealin.id server", n.silent);
          });
      }
      return i;
    }
    callAPI(t, e, i) {
      return new Promise(function (a, n) {
        var r = new XMLHttpRequest();
        r.open(t.toUpperCase(), e, !0),
          (r.responseType = "json"),
          (r.onload = function () {
            this.status >= 200 && this.status < 300
              ? a(r.response)
              : n({
                  status: this.status,
                  statusText:
                    (r.response && r.response.message) || r.statusText,
                });
          }),
          (r.onerror = function () {
            n({ status: this.status, statusText: r.statusText });
          }),
          i
            ? (r.setRequestHeader("content-type", "application/json"),
              r.send(JSON.stringify(i)))
            : r.send();
      });
    }
    checkIsHit() {
      if (document.referrer)
        return (
          new URL(document.referrer).hostname != document.location.hostname
        );
      var t = this.getUniqueCode();
      return !this.getData(this.prefix + t);
    }
    saveData(t, e) {
      var i = JSON.stringify(e);
      if ("undefined" != typeof Storage) window.localStorage.setItem(t, i);
      else {
        var a = [
          t,
          "=",
          i,
          "; domain=.",
          window.location.host.toString(),
          "; path=/;",
        ].join("");
        document.cookie = a;
      }
    }
    getData(t) {
      var e = null;
      "undefined" != typeof Storage
        ? (e = JSON.parse(window.localStorage.getItem(t)))
        : (e = document.cookie.match(new RegExp(t + "=([^;]+)"))) &&
          (e = JSON.parse(e[1]));
      return e;
    }
    deleteData(t) {
      "undefined" != typeof Storage
        ? window.localStorage.removeItem(t)
        : (document.cookie = [
            t,
            "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/; domain=.",
            window.location.host.toString(),
          ].join(""));
    }
    getParam(t) {
      return new URLSearchParams(window.location.search).get(t);
    }
  }
  class n {
    doValidate(t, e) {
      if (e) {
        var i;
        switch (e.type) {
          case "text":
            i = this.validateText(t, e.parameters, e.mandatory);
            break;
          case "date":
            i = this.validateDate(t);
        }
        i && (i = e.name + ": " + i);
      }
      return i;
    }
    validateText(t, e = {}, i = !1) {
      var a = null;
      if (
        ((e = e || {}),
        !(t = t ? t.toString().trim() : null) && i && (a = "cannot be empty!"),
        !a && t)
      ) {
        let i = /^\/|\/(?=$|[a-z]{1,})/;
        var n = e.replaceRegexes;
        n &&
          n.length > 0 &&
          n.some((e) => {
            if (e.regex) {
              var a = e.regex.split(i),
                n = new RegExp(a[1], a[2]);
              t = t.replace(n, e.replace);
            }
          });
        var r = e.regexes;
        r &&
          r.length > 0 &&
          r.some((e) => {
            if (e.regex && e.msg) {
              var n = e.regex.split(i);
              if (!new RegExp(n[1], n[2]).test(t)) return (a = e.msg), !0;
            }
            return !1;
          });
      }
      return a;
    }
    validateDate(t, e = !1) {
      var i = null;
      return e && !date && (i = "cannot be empty!"), i;
    }
  }
  function r(t, e = !0) {
    e ? console.log("dealin.id: " + t) : alert("dealin.id: " + t);
  }
  var s = new a();
  return (
    document.addEventListener("DOMContentLoaded", function (t) {
      s.init();
    }),
    (t.OnlineLeadForm = a),
    (t.defaultForm = s),
    Object.defineProperty(t, "__esModule", { value: !0 }),
    t
  );
})({});
