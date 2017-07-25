(function (global, factory) {
    'use strict';
    var fnc;
    fnc = (typeof exports === 'object' && typeof module !== 'undefined') ? module.exports = factory(require('angular'), require('moment')) : (typeof define === 'function' && define.amd) ? define(['angular', 'moment'], factory) : factory(global.angular, global.moment);
}(this, function (angular, moment) {
    var isIE8 = false;
    isIE8 = !!navigator.userAgent.match(/MSIE 8.0/);

    var angularMajorVersion = angular.version ? angular.version.major : 0;
    var angularMinorVersion = angular.version ? angular.version.minor : 0;

    if (angularMajorVersion !== 1) {
        console.error("angular version not support");
        return;
    }

    var module = angular.module('leading.datePicker', []);

    module.constant('datePickerConfig', {
        template: 'templates/leading-datepicker.html',
        view: 'month',
        views: ['year', 'month', 'date', 'hours', 'minutes'],
        momentNames: {
            year: 'year',
            month: 'month',
            date: 'day',
            hours: 'hours',
            minutes: 'minutes'
        },
        viewConfig: {
            year: ['years', 'isSameYear'],
            month: ['months', 'isSameMonth'],
            hours: ['hours', 'isSameHour'],
            minutes: ['minutes', 'isSameMinutes']
        },
        step: 5
    });

    module.filter('mFormat', function () {
        return function (m, format, tz) {
            if (!m) {
                return undefined;
            }
            if (!(moment.isMoment(m))) {
                m = moment(m);
            }
            return tz ? moment.tz(m, tz).format(format) : m.format(format);
        };
    });

    module.factory('datePickerUtils', function () {
        var tz;
        var createNewDate = function (year, month, day, hour, minute, second) {
            var utc = Date.UTC(year | 0, month | 0, day | 0, hour | 0, minute | 0, second | 0);
            return tz ? moment.tz(utc, tz) : moment(utc);
        };

        return {
            getVisibleMinutes: function (m, step) {
                var year = m.year(),
                    month = m.month(),
                    day = m.date(),
                    hour = m.hours(), pushedDate,
                    offset = m.utcOffset() / 60,
                    minutes = [], minute;

                for (minute = 0; minute < 60; minute += step) {
                    pushedDate = createNewDate(year, month, day, hour - offset, minute);
                    minutes.push(pushedDate);
                }
                return minutes;
            },
            getVisibleWeeks: function (m) {
                m = moment(m);
                var startYear = m.year(),
                    startMonth = m.month();

                //Set date to the first day of the month
                m.date(1);

                //Grab day of the week
                var day = m.day();

                if (day === 0) {
                    //If the first day of the month is a sunday, go back one week.
                    m.date(-6);
                } else {
                    //Otherwise, go back the required number of days to arrive at the previous sunday
                    m.date(1 - day);
                }

                var weeks = [];

                while (weeks.length < 6) {
                    if (m.year() === startYear && m.month() > startMonth) {
                        break;
                    }
                    weeks.push(this.getDaysOfWeek(m));
                    m.add(7, 'd');
                }
                return weeks;
            },
            getVisibleYears: function (d) {
                var m = moment(d),
                    year = m.year();

                m.year(year - (year % 10));
                year = m.year();

                var offset = m.utcOffset() / 60,
                    years = [],
                    pushedDate,
                    actualOffset;

                for (var i = 0; i < 12; i++) {
                    pushedDate = createNewDate(year, 0, 1, 0 - offset);
                    actualOffset = pushedDate.utcOffset() / 60;
                    if (actualOffset !== offset) {
                        pushedDate = createNewDate(year, 0, 1, 0 - actualOffset);
                        offset = actualOffset;
                    }
                    years.push(pushedDate);
                    year++;
                }
                return years;
            },
            getDaysOfWeek: function (m) {
                m = m ? m : (tz ? moment.tz(tz).day(0) : moment().day(0));

                var year = m.year(),
                    month = m.month(),
                    day = m.date(),
                    days = [],
                    pushedDate,
                    offset = m.utcOffset() / 60,
                    actualOffset;

                for (var i = 0; i < 7; i++) {
                    pushedDate = createNewDate(year, month, day, 0 - offset, 0, false);
                    actualOffset = pushedDate.utcOffset() / 60;
                    if (actualOffset !== offset) {
                        pushedDate = createNewDate(year, month, day, 0 - actualOffset, 0, false);
                    }
                    days.push(pushedDate);
                    day++;
                }
                return days;
            },
            getVisibleMonths: function (m) {
                var year = m.year(),
                    offset = m.utcOffset() / 60,
                    months = [],
                    pushedDate,
                    actualOffset;

                for (var month = 0; month < 12; month++) {
                    pushedDate = createNewDate(year, month, 1, 0 - offset, 0, false);
                    actualOffset = pushedDate.utcOffset() / 60;
                    if (actualOffset !== offset) {
                        pushedDate = createNewDate(year, month, 1, 0 - actualOffset, 0, false);
                    }
                    months.push(pushedDate);
                }
                return months;
            },
            getVisibleHours: function (m) {
                var year = m.year(),
                    month = m.month(),
                    day = m.date(),
                    hours = [],
                    hour, pushedDate, actualOffset,
                    offset = m.utcOffset() / 60;

                for (hour = 0; hour < 24; hour++) {
                    pushedDate = createNewDate(year, month, day, hour - offset, 0, false);
                    actualOffset = pushedDate.utcOffset() / 60;
                    if (actualOffset !== offset) {
                        pushedDate = createNewDate(year, month, day, hour - actualOffset, 0, false);
                    }
                    hours.push(pushedDate);
                }

                return hours;
            },
            isAfter: function (model, date) {
                return model && model.unix() >= date.unix();
            },
            isBefore: function (model, date) {
                return model.unix() <= date.unix();
            },
            isSameYear: function (model, date) {
                return model && model.year() === date.year();
            },
            isSameMonth: function (model, date) {
                return this.isSameYear(model, date) && model.month() === date.month();
            },
            isSameDay: function (model, date) {
                return this.isSameMonth(model, date) && model.date() === date.date();
            },
            isSameHour: function (model, date) {
                return this.isSameDay(model, date) && model.hours() === date.hours();
            },
            isSameMinutes: function (model, date) {
                return this.isSameHour(model, date) && model.minutes() === date.minutes();
            },
            setParams: function (zone) {
                tz = zone;
            },
            findFunction: function (scope, name) {
                //Search scope ancestors for a matching function.
                //Can probably combine this and the below function
                //into a single search function and two comparison functions
                //Need to add support for lodash style selectors (eg, 'objectA.objectB.function')
                var parentScope = scope;
                do {
                    parentScope = parentScope.$parent;
                    if (angular.isFunction(parentScope[name])) {
                        return parentScope[name];
                    }
                } while (parentScope.$parent);

                return false;
            },
            findParam: function (scope, name) {
                var parentScope = scope;
                do {
                    parentScope = parentScope.$parent;
                    if (name.indexOf(".") !== -1) {
                        if (parentScope.$eval(name)) {
                            return parentScope.$eval(name);
                        }
                    } else {
                        if (parentScope[name]) {
                            return parentScope[name];
                        }
                    }
                } while (parentScope.$parent);

                return false;
            },
            createMoment: function (m) {
                if (tz) {
                    return moment.tz(m, tz);
                } else {
                    //If input is a moment, and we have no TZ info, we need to remove TZ
                    //info from the moment, otherwise the newly created moment will take
                    //the timezone of the input moment. The easiest way to do that is to
                    //take the unix timestamp, and use that to create a new moment.
                    //The new moment will use the local timezone of the user machine.
                    return moment.isMoment(m) ? moment.unix(m.unix()) : moment(m);
                }
            },
            getDate: function (scope, attrs, name) {
                var result = false;
                if (attrs[name]) {
                    result = this.createMoment(attrs[name]);
                    if (!result.isValid()) {
                        result = this.findParam(scope, attrs[name]);
                        if (result) {
                            result = this.createMoment(result);
                        }
                    }
                }

                return result;
            },
            eventIsForPicker: function (targetIDs, pickerID) {
                //Checks if an event targeted at a specific picker, via either a string name, or an array of strings.
                return (angular.isArray(targetIDs) && targetIDs.indexOf(pickerID) > -1 || targetIDs === pickerID);
            }
        };
    });

    var PRISTINE_CLASS = 'ng-pristine',
        DIRTY_CLASS = 'ng-dirty',
        INVALID_PARSE_CLASS = "ng-invalid-parse";

    module.constant('dateTimeConfig', {
        template: function (attrs, id) {
            return '' +
                '<div ' +
                (id ? 'id="' + id + '" ' : '') +
                'date-picker="' + attrs.ngModel + '" ' +
                (attrs.view ? 'view="' + attrs.view + '" ' : '') +
                (attrs.maxView ? 'max-view="' + attrs.maxView + '" ' : '') +
                (attrs.maxDate ? 'max-date="' + attrs.maxDate + '" ' : '') +
                (attrs.autoClose ? 'auto-close="' + attrs.autoClose + '" ' : '') +
                (attrs.template ? 'template="' + attrs.template + '" ' : '') +
                (attrs.minView ? 'min-view="' + attrs.minView + '" ' : '') +
                (attrs.minDate ? 'min-date="' + attrs.minDate + '" ' : '') +
                (attrs.partial ? 'partial="' + attrs.partial + '" ' : '') +
                (attrs.step ? 'step="' + attrs.step + '" ' : '') +
                (attrs.onSetDate ? 'date-change="' + attrs.onSetDate + '" ' : '') +
                (attrs.ngModel ? 'ng-model="' + attrs.ngModel + '" ' : '') +
                (attrs.timezone ? 'timezone="' + attrs.timezone + '" ' : '') +
                'class="date-picker-date-time"></div>';
        },
        format: 'YYYY-MM-DD',
        views: ['date', 'year', 'month', 'hours', 'minutes'],
        autoClose: true,
        position: 'relative'
    });

    module.directive('dateTimeAppend', function () {
        return {
            link: function (scope, element) {
                element.bind('click', function () {
                    element.find('input')[0].focus();
                });
            }
        };
    });

    module.directive('datePicker', ['datePickerConfig', 'datePickerUtils', function (datePickerConfig, datePickerUtils) {
        return {
            require: '?ngModel',
            template: '<div ng-include="template"></div>',
            scope: {
                model: '=datePicker'
            },
            link: function (scope, element, attrs, ngModel) {

                scope.dateClassType = function (classes) {
                    if (!classes) {
                        return "else";
                    }
                    if (classes.indexOf('un-show') !== -1) {
                        return "un-show";
                    } else if (classes.indexOf('prev-month') !== -1) {
                        return "prev-month";
                    } else if (classes.indexOf('next-month') !== -1) {
                        return "next-month";
                    } else {
                        return "else";
                    }
                };

                function prepareViews() {
                    scope.views = datePickerConfig.views.concat();
                    scope.view = attrs.view || datePickerConfig.view;

                    scope.views = scope.views.slice(
                        scope.views.indexOf(attrs.maxView || 'year'),
                        scope.views.indexOf(attrs.minView || 'minutes') + 1
                    );

                    if (scope.views.length === 1 || scope.views.indexOf(scope.view) === -1) {
                        scope.view = scope.views[0];
                    }
                }

                function getDate(name) {
                    return datePickerUtils.getDate(scope, attrs, name);
                }

                datePickerUtils.setParams(attrs.timezone);

                var arrowClick = false,
                    tz = scope.tz = attrs.timezone,
                    createMoment = datePickerUtils.createMoment,
                    eventIsForPicker = datePickerUtils.eventIsForPicker,
                    step = parseInt(attrs.step || datePickerConfig.step, 10),
                    partial = !!attrs.partial,
                    minDate = getDate('minDate'),
                    maxDate = getDate('maxDate'),
                    pickerID = element[0].id,
                    now = scope.now = createMoment(),
                    selected = scope.date = createMoment(scope.model || now),
                    autoClose = attrs.autoClose === 'true';

                if (!scope.model) {
                    selected.minute(Math.ceil(selected.minute() / step) * step).second(0);
                }

                scope.template = attrs.template || datePickerConfig.template;

                scope.watchDirectChanges = attrs.watchDirectChanges !== undefined;
                scope.callbackOnSetDate = attrs.dateChange ? datePickerUtils.findFunction(scope, attrs.dateChange) : undefined;

                prepareViews();

                scope.setView = function (nextView) {
                    if (scope.views.indexOf(nextView) !== -1) {
                        scope.view = nextView;
                    }
                };

                scope.selectNonMonthDate = function (date) {
                    if (attrs.disabled) {
                        return false;
                    }
                    if (isSame(scope.date, date)) {
                        date = scope.date;
                    }
                    date = clipDate(date);
                    if (!date) {
                        return false;
                    }
                    scope.date = date;
                    scope.model = date;
                    scope.setView("date");
                };

                scope.selectDate = function (date) {
                    if (attrs.disabled) {
                        return false;
                    }
                    if (isSame(scope.date, date)) {
                        date = scope.date;
                    }
                    date = clipDate(date);
                    if (!date) {
                        return false;
                    }
                    scope.date = date;

                    var nextView = scope.views[scope.views.indexOf(scope.view) + 1];
                    if ((!nextView || partial) || scope.model) {
                        setDate(date);
                    }

                    if (nextView) {
                        scope.setView(nextView);
                    } else if (autoClose) {
                        element.addClass('hidden');
                        scope.$emit('hidePicker');
                    } else {
                        prepareViewData();
                    }
                };

                function setDate(date) {
                    if (date) {
                        scope.model = date;
                        if (ngModel) {
                            ngModel.$setViewValue(date);
                        }
                    }
                    scope.$emit('setDate', scope.model, scope.view);

                    //This is duplicated in the new functionality.
                    if (scope.callbackOnSetDate) {
                        scope.callbackOnSetDate(attrs.datePicker, scope.date);
                    }
                }

                function update() {
                    var view = scope.view;
                    datePickerUtils.setParams(tz);

                    if (scope.model && !arrowClick) {
                        scope.date = createMoment(scope.model);
                        arrowClick = false;
                    }

                    var date = scope.date;

                    switch (view) {
                        case 'year':
                            scope.years = datePickerUtils.getVisibleYears(date);
                            break;
                        case 'month':
                            scope.months = datePickerUtils.getVisibleMonths(date);
                            break;
                        case 'date':
                            scope.weekdays = scope.weekdays || datePickerUtils.getDaysOfWeek();
                            scope.weeks = datePickerUtils.getVisibleWeeks(date);
                            break;
                        case 'hours':
                            scope.hours = datePickerUtils.getVisibleHours(date);
                            break;
                        case 'minutes':
                            scope.minutes = datePickerUtils.getVisibleMinutes(date, step);
                            break;
                    }

                    prepareViewData();
                }

                function watch() {
                    if (scope.view !== 'date') {
                        return scope.view;
                    }
                    return scope.date ? scope.date.month() : null;
                }

                scope.$watch(watch, update);

                if (scope.watchDirectChanges) {
                    scope.$watch('model', function () {
                        arrowClick = false;
                        update();
                    });
                }

                function prepareViewData() {
                    if(minDate && minDate.isAfter(scope.date)){
                        scope.date = minDate;
                    }
                    if(maxDate && maxDate.isBefore(scope.date)){
                        scope.date = maxDate;
                    }
                    var view = scope.view,
                        date = scope.date,
                        classes = [], classList = '',
                        i, j;

                    datePickerUtils.setParams(tz);
                    if (view === 'date') {
                        var weeks = scope.weeks, week;
                        for (i = 0; i < weeks.length; i++) {
                            week = weeks[i];
                            classes.push([]);
                            for (j = 0; j < week.length; j++) {
                                classList = '';
                                if (datePickerUtils.isSameDay(date, week[j])) {
                                    classList += 'active';
                                }
                                if (isNow(week[j], view)) {
                                    classList += ' now';
                                }
                                if (week[j].month() !== date.month()) {
                                    if (week[j].month() > date.month()) {
                                        classList += ' next-month';
                                    } else {
                                        classList += ' prev-month';
                                    }
                                }

                                if (!inValidRange(week[j])) {
                                    classList += ' un-show';
                                }
                                classes[i].push(classList);
                            }
                        }
                    } else {
                        var params = datePickerConfig.viewConfig[view],
                            dates = scope[params[0]],
                            compareFunc = params[1];

                        for (i = 0; i < dates.length; i++) {
                            classList = '';
                            if (datePickerUtils[compareFunc](date, dates[i])) {
                                classList += 'active';
                            }
                            if (isNow(dates[i], view)) {
                                classList += ' now';
                            }
                            if (!inValidRange(dates[i])) {
                                classList += ' un-show';
                            }
                            classes.push(classList);
                        }
                    }
                    scope.classes = classes;
                }

                scope.next = function (delta) {
                    var date = moment(scope.date);
                    delta = delta || 1;
                    switch (scope.view) {
                        case 'year':
                        /*falls through*/
                        case 'month':
                            date.year(date.year() + delta);
                            break;
                        case 'date':
                            date.month(date.month() + delta);
                            break;
                        case 'hours':
                        /*falls through*/
                        case 'minutes':
                            date.hours(date.hours() + delta);
                            break;
                    }
                    date = clipDate(date);
                    if (date) {
                        scope.date = date;
                        setDate(date);
                        arrowClick = true;
                        update();
                    }
                };

                function inValidRange(date) {
                    var valid = true;
                    if (minDate && minDate.isAfter(date)) {
                        valid = isSame(minDate, date);
                    }
                    if (maxDate && maxDate.isBefore(date)) {
                        valid &= isSame(maxDate, date);
                    }
                    return valid;
                }

                function isSame(date1, date2) {
                    return date1.isSame(date2, datePickerConfig.momentNames[scope.view]) ? true : false;
                }

                function clipDate(date) {
                    if (minDate && minDate.isAfter(date)) {
                        return minDate;
                    } else if (maxDate && maxDate.isBefore(date)) {
                        return maxDate;
                    } else {
                        return date;
                    }
                }

                function isNow(date, view) {
                    var is = true;

                    switch (view) {
                        case 'minutes':
                            is &= ~~(now.minutes() / step) === ~~(date.minutes() / step);
                        /* falls through */
                        case 'hours':
                            is &= now.hours() === date.hours();
                        /* falls through */
                        case 'date':
                            is &= now.date() === date.date();
                        /* falls through */
                        case 'month':
                            is &= now.month() === date.month();
                        /* falls through */
                        case 'year':
                            is &= now.year() === date.year();
                    }
                    return is;
                }

                scope.prev = function (delta) {
                    return scope.next(-delta || -1);
                };

                if (pickerID) {
                    scope.$on('pickerUpdate', function (event, pickerIDs, data) {
                        if (eventIsForPicker(pickerIDs, pickerID)) {
                            var updateViews = false, updateViewData = false;

                            if (angular.isDefined(data.minDate)) {
                                minDate = data.minDate ? data.minDate : false;
                                updateViewData = true;
                            }
                            if (angular.isDefined(data.maxDate)) {
                                maxDate = data.maxDate ? data.maxDate : false;
                                updateViewData = true;
                            }

                            if (angular.isDefined(data.minView)) {
                                attrs.minView = data.minView;
                                updateViews = true;
                            }
                            if (angular.isDefined(data.maxView)) {
                                attrs.maxView = data.maxView;
                                updateViews = true;
                            }
                            attrs.view = data.view || attrs.view;

                            if (updateViews) {
                                prepareViews();
                            }

                            if (updateViewData) {
                                update();
                            }
                        }
                    });
                }
            }
        };
    }]);

    module.directive('dateTime', ['$compile', '$document', '$filter', 'dateTimeConfig', '$parse', 'datePickerUtils', function ($compile, $document, $filter, dateTimeConfig, $parse, datePickerUtils) {
        var body = $document.find('body');
        var dateFilter = $filter('mFormat');
        return {
            require: 'ngModel',
            scope: true,
            link: function (scope, element, attrs, ngModel) {
                var format = attrs.format || dateTimeConfig.format,
                    parentForm = element.inheritedData('$formController'),
                    views = $parse(attrs.views)(scope) || dateTimeConfig.views.concat(),
                    view = attrs.view || views[0],
                    index = views.indexOf(view),
                    dismiss = attrs.autoClose ? $parse(attrs.autoClose)(scope) : dateTimeConfig.autoClose,
                    picker = null,
                    pickerID = element[0].id,
                    position = attrs.position || dateTimeConfig.position,
                    container = null,
                    minDate = null,
                    minValid = null,
                    maxDate = null,
                    maxValid = null,
                    timezone = attrs.timezone || false,
                    eventIsForPicker = datePickerUtils.eventIsForPicker,
                    dateChange = null,
                    shownOnce = false,
                    isArea = false,
                    template;

                if (index === -1) {
                    views.splice(index, 1);
                }

                views.unshift(view);

                function formatter(value) {
                    return dateFilter(value, format, timezone);
                }

                function parserMoreThan1_2(viewValue) {
                    if (viewValue) {
                        if (viewValue.length === format.length) {
                            ngModel.$setValidity("format", true);
                            return moment(viewValue);
                        } else {
                            ngModel.$setValidity("format", false);
                            return undefined;
                        }
                    } else {
                        ngModel.$setValidity("format", true);
                        return null;
                    }
                }

                function parserMoreThan1_3(viewValue) {
                    if (viewValue) {
                        if (viewValue.length === format.length) {
                            return moment(viewValue);
                        } else {
                            return undefined;
                        }
                    } else {
                        return null;
                    }
                }

                function setMin(date) {
                    if(angular.isDate(date)){
                        date = moment(date);
                    }else if(angular.isNumber(date)){
                        date = moment(date);
                    }else if(angular.isString(date)){
                        date = moment(date);
                    }
                    minDate = date;
                    attrs.minDate = date ? date.format() : date;
                    minValid = moment.isMoment(date);
                }

                function setMax(date) {
                    if(angular.isDate(date)){
                        date = moment(date);
                    }else if(angular.isNumber(date)){
                        date = moment(date);
                    }else if(angular.isString(date)){
                        date = moment(date);
                    }
                    maxDate = date;
                    attrs.maxDate = date ? date.format() : date;
                    maxValid = moment.isMoment(date);
                }

                ngModel.$formatters.push(formatter);

                if (angularMinorVersion > 0 && angularMinorVersion <= 2) {
                    ngModel.$parsers.unshift(parserMoreThan1_2);
                }else if (angularMinorVersion > 2) {
                    ngModel.$parsers.unshift(parserMoreThan1_3);
                }

                scope.$watch(attrs.maxDate, function (newVal, oldVal) {
                    if (angular.equals(newVal, oldVal)) {
                        return;
                    }
                    scope.$broadcast('pickerUpdate', pickerID, {maxDate: newVal});
                });
                scope.$watch(attrs.minDate, function (newVal, oldVal) {
                    if (angular.equals(newVal, oldVal)) {
                        return;
                    }
                    scope.$broadcast('pickerUpdate', pickerID, {minDate: newVal});
                });

                if (angular.isDefined(attrs.minDate)) {
                    setMin(datePickerUtils.findParam(scope, attrs.minDate));
                    if (angularMinorVersion > 0 && angularMinorVersion <= 2) {
                        ngModel.$parsers.push(function (value) {
                            if (value) {
                                if ((minValid ? moment.isMoment(value) && (minDate.isSame(value) || minDate.isBefore(value)) : true)) {
                                    ngModel.$setValidity("min", true);
                                    return value;
                                } else {
                                    ngModel.$setValidity("min", false);
                                    return undefined;
                                }
                            } else {
                                ngModel.$setValidity("min", true);
                                return null;
                            }

                        });
                    } else if (angularMinorVersion > 2) {
                        ngModel.$validators.min = function (value) {
                            if(value){
                                return minValid ? moment.isMoment(value) && (minDate.isSame(value) || minDate.isBefore(value)) : true;
                            }else{
                                return true;
                            }
                        };
                    }
                }

                if (angular.isDefined(attrs.maxDate)) {
                    setMax(datePickerUtils.findParam(scope, attrs.maxDate));
                    if (angularMinorVersion > 0 && angularMinorVersion <= 2) {
                        ngModel.$parsers.push(function (value) {
                            if (value) {
                                if ((maxValid ? moment.isMoment(value) && (maxDate.isSame(value) || maxDate.isAfter(value)) : true)) {
                                    ngModel.$setValidity("max", true);
                                    return value;
                                } else {
                                    ngModel.$setValidity("max", false);
                                    return undefined;
                                }
                            } else {
                                ngModel.$setValidity("max", true);
                                return null;
                            }
                        });
                    } else if (angularMinorVersion > 2) {
                        ngModel.$validators.max = function (value) {
                            if(value){
                                return maxValid ? moment.isMoment(value) && (maxDate.isSame(value) || maxDate.isAfter(value)) : true;
                            }else{
                                return true;
                            }
                        };
                    }
                }

                if (angular.isDefined(attrs.dateChange)) {
                    dateChange = datePickerUtils.findFunction(scope, attrs.dateChange);
                }

                function getTemplate() {
                    template = dateTimeConfig.template(attrs);
                }

                function updateInput(event) {
                    event.stopPropagation();
                    if (ngModel.$pristine) {
                        ngModel.$dirty = true;
                        ngModel.$pristine = false;
                        element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
                        if (parentForm) {
                            parentForm.$setDirty();
                        }
                        ngModel.$render();
                    }
                }

                function clear() {
                    if (isIE8) {
                        if (isArea) {
                            return;
                        }
                    }
                    if (picker) {
                        picker.remove();
                        picker = null;
                    }
                    if (container) {
                        container.remove();
                        container = null;
                    }
                }

                if (pickerID) {
                    scope.$on('pickerUpdate', function (event, pickerIDs, data) {
                        if (eventIsForPicker(pickerIDs, pickerID)) {
                            if (picker) {
                                //Need to handle situation where the data changed but the picker is currently open.
                                //To handle this, we can create the inner picker with a random ID, then forward
                                //any events received to it.
                            } else {
                                var validateRequired = false;
                                if (angular.isDefined(data.minDate)) {
                                    setMin(data.minDate);
                                    validateRequired = true;
                                }
                                if (angular.isDefined(data.maxDate)) {
                                    setMax(data.maxDate);
                                    validateRequired = true;
                                }

                                if (angular.isDefined(data.minView)) {
                                    attrs.minView = data.minView;
                                }
                                if (angular.isDefined(data.maxView)) {
                                    attrs.maxView = data.maxView;
                                }
                                attrs.view = data.view || attrs.view;

                                if (validateRequired) {
                                    if (angularMinorVersion > 0 && angularMinorVersion <= 2) {
                                        ngModel.$render();
                                    } else if (angularMinorVersion > 2) {
                                        ngModel.$validate();
                                    }
                                }
                                if (angular.isDefined(data.format)) {
                                    format = attrs.format = data.format || dateTimeConfig.format;
                                    ngModel.$modelValue = -1; //Triggers formatters. This value will be discarded.
                                }
                                getTemplate();
                            }
                        }
                    });
                }

                function showPicker() {
                    if (picker) {
                        return;
                    }
                    // create picker element
                    picker = $compile(template)(scope);

                    scope.$digest();

                    //If the picker has already been shown before then we shouldn't be binding to events, as these events are already bound to in this scope.
                    if (!shownOnce) {
                        scope.$on('setDate', function (event, date, view) {
                            updateInput(event);
                            if (dateChange) {
                                dateChange(attrs.ngModel, date);
                            }
                            if (dismiss && views[views.length - 1] === view) {
                                clear();
                            }
                        });

                        scope.$on('hidePicker', function () {
                            element.triggerHandler('blur');
                        });

                        scope.$on('$destroy', clear);

                        shownOnce = true;
                    }
                    // move picker below input element
                    if (position === 'absolute') {
                        var pos = angular.extend(element.offset(), {height: element[0].offsetHeight});
                        var height = pos.height || element[0].offsetHeight;
                        picker.css({
                            top: (pos.top + height + 5) + 'px',
                            left: pos.left + 'px',
                            display: 'block',
                            position: position
                        });
                        body.append(picker);
                    } else {
                        // relative
                        container = angular.element('<div date-picker-wrapper></div>');
                        element[0].parentElement.insertBefore(container[0], element[0]);
                        container.append(picker);
                        picker.css({top: element[0].offsetHeight + 5 + 'px', display: 'block'});
                    }
                    picker.bind('mousedown', function (evt) {
                        isArea = true;
                        evt.preventDefault();
                    });
                    if (isIE8) {
                        picker.bind('mouseleave', function (evt) {
                            isArea = false;
                            element.focus();
                        });
                    }
                }

                element.bind('focus', showPicker);
                element.bind('blur', clear);
                getTemplate();
            }
        };
    }]);

    module.run(['$templateCache', function ($templateCache) {
        $templateCache.put('templates/leading-datepicker.html',
            "<div ng-switch=\"view\" class=\"datepicker-container\">\r" +
            "\n" +
            "<div ng-switch-when=\"year\" class=\"datepicker-panel datepicker-panel-years\">\r" +
            "\n" +
            "<ul class=\"datepicker-panel-header\">\r" +
            "\n" +
            "<li class=\"prev\" ng-click=\"prev(10)\"><i>&lsaquo;</i></li>\r" +
            "\n" +
            "<li class=\"current\" ng-bind=\"years[0].year()+' - '+years[years.length-1].year()\"></li>\r" +
            "\n" +
            "<li class=\"next\" ng-click=\"next(10)\"><i>&rsaquo;</i></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "<ul class=\"datepicker-panel-content years\">\r" +
            "\n" +
            "<li class=\"year\" ng-repeat-start=\"year in years\" ng-class=\"classes[$index]\" ng-if=\"dateClassType(classes[$index]) == 'else'\" ng-click=\"selectDate(year)\" ng-bind=\"year.year()\"></li>\r" +
            "\n" +
            "<li class=\"year\" ng-repeat-end ng-class=\"classes[$index]\" ng-if=\"dateClassType(classes[$index]) == 'un-show'\"></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "</div>\r" +
            "\n" +
            "<div ng-switch-when=\"month\" class=\"datepicker-panel datepicker-panel-months\">\r" +
            "\n" +
            "<ul class=\"datepicker-panel-header\">\r" +
            "\n" +
            "<li class=\"prev\" ng-click=\"prev()\"><i>&lsaquo;</i></li>\r" +
            "\n" +
            "<li class=\"current\" ng-click=\"setView('year')\" ng-bind=\"date|mFormat:'YYYY':tz\"></li>\r" +
            "\n" +
            "<li class=\"next\" ng-click=\"next()\"><i>&rsaquo;</i></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "<ul class=\"datepicker-panel-content months\">\r" +
            "\n" +
            "<li class=\"month\" ng-repeat=\"month in months\" ng-class=\"classes[$index]\" ng-if=\"dateClassType(classes[$index]) == 'else'\" ng-click=\"selectDate(month)\" ng-bind=\"month|mFormat:'MMM':tz\"></li>\r" +
            "\n" +
            "<li class=\"month\" ng-repeat-end ng-class=\"classes[$index]\" ng-if=\"dateClassType(classes[$index]) == 'un-show'\"></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "</div>\r" +
            "\n" +
            "<div ng-switch-when=\"date\" class=\"datepicker-panel datepicker-panel-dates\">\r" +
            "\n" +
            "<ul class=\"datepicker-panel-header\">\r" +
            "\n" +
            "<li class=\"prev\" ng-click=\"prev()\"><i>&lsaquo;</i></li>\r" +
            "\n" +
            "<li class=\"current\" ng-click=\"setView('month')\" ng-bind=\"date|mFormat:'MMMM YYYY':tz\"></li>\r" +
            "\n" +
            "<li class=\"next\" ng-click=\"next()\"><i>&rsaquo;</i></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "<ul class=\"datepicker-panel-header weeks\">\r" +
            "\n" +
            "<li class=\"week\" ng-repeat=\"day in weekdays\" ng-bind=\"day|mFormat:'ddd':tz\"></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "<ul class=\"datepicker-panel-content days\" ng-repeat=\"week in weeks\" ng-init=\"$weekIndex = $index\">\r" +
            "\n" +
            "<li class=\"day\" ng-repeat-start=\"day in week\" ng-class=\"classes[$weekIndex][$index]\" ng-if=\"dateClassType(classes[$weekIndex][$index]) == 'un-show'\"></li>\r" +
            "\n" +
            "<li class=\"day\" ng-class=\"classes[$weekIndex][$index]\" ng-bind=\"day|mFormat:'DD':tz\" ng-if=\"dateClassType(classes[$weekIndex][$index]) == 'prev-month'\" ng-click=\"selectNonMonthDate(day)\"></li>\r" +
            "\n" +
            "<li class=\"day\" ng-class=\"classes[$weekIndex][$index]\" ng-bind=\"day|mFormat:'DD':tz\" ng-if=\"dateClassType(classes[$weekIndex][$index]) == 'next-month'\" ng-click=\"selectNonMonthDate(day)\"></li>\r" +
            "\n" +
            "<li class=\"day\" ng-repeat-end ng-class=\"classes[$weekIndex][$index]\" ng-bind=\"day|mFormat:'DD':tz\" ng-if=\"dateClassType(classes[$weekIndex][$index]) == 'else'\" ng-click=\"selectDate(day)\"></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "</div>\r" +
            "\n" +
            "<div ng-switch-when=\"hours\" class=\"datepicker-panel datepicker-panel-hours\">\r" +
            "\n" +
            "<ul class=\"datepicker-panel-header\">\r" +
            "\n" +
            "<li class=\"prev\" ng-click=\"prev(24)\"><i>&lsaquo;</i></li>\r" +
            "\n" +
            "<li class=\"current\" ng-click=\"setView('date')\" ng-bind=\"date|mFormat:'DD MMMM YYYY':tz\"></li>\r" +
            "\n" +
            "<li class=\"next\" ng-click=\"next(24)\"><i>&rsaquo;</i></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "<ul class=\"datepicker-panel-content hours\">\r" +
            "\n" +
            "<li class=\"hour\" ng-repeat=\"hour in hours\" ng-class=\"classes[$index]\" ng-if=\"dateClassType(classes[$index]) == 'else'\" ng-click=\"selectDate(hour)\" ng-bind=\"hour|mFormat:'HH:mm':tz\"></li>\r" +
            "\n" +
            "<li class=\"hour\" ng-repeat-end ng-class=\"classes[$index]\" ng-if=\"dateClassType(classes[$index]) == 'un-show'\"></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "</div>\r" +
            "\n" +
            "<div ng-switch-when=\"minutes\" class=\"datepicker-panel datepicker-panel-minutes\">\r" +
            "\n" +
            "<ul class=\"datepicker-panel-header\">\r" +
            "\n" +
            "<li class=\"prev\" ng-click=\"prev()\"><i>&lsaquo;</i></li>\r" +
            "\n" +
            "<li class=\"current\" ng-click=\"setView('hours')\" ng-bind=\"date|mFormat:'DD MMMM YYYY':tz\"></li>\r" +
            "\n" +
            "<li class=\"next\" ng-click=\"next()\"><i>&rsaquo;</i></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "<ul class=\"datepicker-panel-content minutes\">\r" +
            "\n" +
            "<li class=\"minute\" ng-repeat=\"minute in minutes\" ng-class=\"classes[$index]\" ng-if=\"dateClassType(classes[$index]) == 'else'\" ng-click=\"selectDate(minute)\" ng-bind=\"minute|mFormat:'HH:mm':tz\"></li>\r" +
            "\n" +
            "<li class=\"minute\" ng-repeat=\"minute in minutes\" ng-class=\"classes[$index]\" ng-if=\"dateClassType(classes[$index]) == 'un-show'\"></li>\r" +
            "\n" +
            "</ul>\r" +
            "\n" +
            "</div>\r" +
            "\n" +
            "</div>"
        );
    }]);
}));