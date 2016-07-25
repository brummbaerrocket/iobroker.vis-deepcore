/*
    ioBroker.vis deepcore Widget-Set

    version: "0.0.1"

    Copyright 10.2015-2016 DeepCore<devap@deepcore.eu>

*/
"use strict";

// add translations for edit mode
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        "borderOn": { "en": "Border On", "de": "Rahmenfarbe Ein", "ru": "Border On" },
        "borderOn_tooltip": {
            "en": "Color of border when on",
            "de": "Rahmenfarbe wenn Ein",
            "ru": "Color of border when on"
        },
        "borderOff": { "en": "Border Off", "de": "Rahmenfarbe Aus", "ru": "Border Off" },
        "borderOff_tooltip": {
            "en": "Color of border when off",
            "de": "Rahmenfarbe wenn Aus",
            "ru": "Color of border when off"
        },
		"icon": { "en": "Icon", "de": "Symbol", "ru": "Icon" },
    });
};

// add translations for non-edit mode
$.extend(true, systemDictionary, {
    "Instance": { "en": "Instance", "de": "Instanz", "ru": "Инстанция" }
});

vis.binds.deepcore = {
    version: "0.0.1",
    showVersion: function() {
        if (vis.binds.deepcore.version) {
            console.log('Deepcore widget version: ' + vis.binds.deepcore.version);
            vis.binds.deepcore.version = null;
        }
    },
    togglerHelper: function($this, val, min, max, value, reverse) {

        if (val === true || val === 'true') val = max;
        if (val === false || val === 'false') val = min;

        if (max === undefined || max === '' || max === null) {
            max = 1;
            min = 0;
            val = (val === 'false' || val === false || val === 0 || val === '0' || val === '' || val === null || val === undefined) ? min : max;
        }

        if (reverse) {
            if (val == max) {
                val = min;
            } else {
                val = max;
            }
        }

        if (value === undefined && val > min && val !== true) {
            val = parseFloat(val) || 0;
        }

        if ((value === undefined && val > min) || (value !== undefined && val == value)) {
            $this.css("border-color", $this.attr("data-brdon"));
        } else {
            $this.css("border-color", $this.attr("data-brdoff"));
        }
    },
    toggler: function(el, reverse, _value) {
        var $this = $(el);
        var oid = $this.data('oid');
        var max = $this.data('max') || 1;
        var min = $this.data('min') || 0;
        //alert("toggler");
        if (oid) {
            vis.states.bind(oid + '.val', function(e, newVal, oldVal) {
                vis.binds.deepcore.togglerHelper($this, newVal, min, max, _value, reverse);
            });
            
            vis.binds.deepcore.togglerHelper($this, vis.states.attr(oid + '.val'), min, max, _value, reverse);
        }
    },
    toggle: function(el, oid) {
        var $this = $(el);
        var oid = oid || $this.data('oid');
        var min = $this.data('min');
        var max = $this.data('max');
        //alert(oid);
        var urlTrue = $this.data('url-true');
        var urlFalse = $this.data('url-false');
        var oidTrue = $this.data('oid-true');
        var oidFalse = $this.data('oid-false');
        var oidTrueVal = $this.data('oid-true-value');
        var oidFalseVal = $this.data('oid-false-value');
        var readOnly = $this.data('read-only');

        if (min === '') min = undefined;
        if (max === '') max = undefined;

        if ((oid || oidTrue || urlTrue) && !vis.editMode && !readOnly) {
            $this.on('click touchstart', function() {
                // Protect against two events
                if (vis.detectBounce(this)) return;
                var val;

                if (oidTrue || urlTrue) {
                    if (!oidFalse && oidTrue) oidFalse = oidTrue;
                    if (!urlFalse && urlTrue) urlFalse = urlTrue;

                    if (!oid || oid == 'nothing_selected') {
                        val = !$(this).data('state');
                        // remember state
                        $(this).data('state', val);
                    } else {
                        val = vis.states[oid + '.val'];
                        if (max !== undefined) {
                            val = (val == max);
                        } else {
                            val = (val === 1 || val === '1' || val === true || val === 'true');
                        }
                        val = !val; // invert
                    }
                    if (min === undefined || min === 'false' || min === null) min = false;
                    if (max === undefined || max === 'true' || max === null) max = true;

                    if (oidTrue) {
                        if (val) {
                            if (oidTrueVal === undefined || oidTrueVal === null) oidTrueVal = max;
                            if (oidTrueVal === 'false') oidTrueVal = false;
                            if (oidTrueVal === 'true') oidTrueVal = true;
                            var f = parseFloat(oidTrueVal);
                            if (f.toString() == oidTrueVal) oidTrueVal = f;
                            vis.setValue(oidTrue, oidTrueVal);
                        } else {
                            if (oidFalseVal === undefined || oidFalseVal === null) oidFalseVal = min;
                            if (oidFalseVal === 'false') oidFalseVal = false;
                            if (oidFalseVal === 'true') oidFalseVal = true;
                            var f = parseFloat(oidFalseVal);
                            if (f.toString() == oidFalseVal) oidFalseVal = f;
                            vis.setValue(oidFalse, oidFalseVal);
                        }
                    }

                    if (urlTrue) {
                        if (val) {
                            vis.conn.httpGet(urlTrue)
                        } else {
                            vis.conn.httpGet(urlFalse);
                        }
                    }

                    // show new state
                    if (!oid || oid == 'nothing_selected') {
                        var img = $(this).data('img-class');
                        if (val) {
                            if ($(this).data('as-button')) $(this).addClass('ui-state-active');
                            val = $(this).data('img-true');
                        } else {
                            val = $(this).data('img-false')
                            if ($(this).data('as-button')) $(this).removeClass('ui-state-active');
                        }
                        $(this).find('.' + img).attr('src', val);
                    }
                } else {
                    var val = vis.states[oid + '.val'];
                    if ((min === undefined && (val === null || val === '' || val === undefined || val === false ||  val === 'false')) ||
                        (min !== undefined && min == val)) {
                        vis.setValue(oid, max !== undefined ? max : true);
                    } else
                    if ((max === undefined && (val === true ||  val === 'true')) ||
                        (max !== undefined && val == max)) {
                        vis.setValue(oid, min !== undefined ? min : false);
                    } else {
                        val = parseFloat(val);
                        if (min !== undefined && max !== undefined) {
                            if (val >= (max - min) / 2) {
                                val = min;
                            } else {
                                val = max;
                            }
                        } else {
                            if (val >= 0.5) {
                                val = 0;
                            } else {
                                val = 1;
                            }
                        }
                        vis.setValue(oid, val);
                    }
                }
            });
        }
    }
};


vis.binds.deepcore.showVersion();
