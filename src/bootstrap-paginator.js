/**
 * bootstrap-paginator.js v0.3
 * --
 * Copyright 2013 Yun Lai <lyonlai1984@gmail.com>
 * --
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function ($) {

    "use strict"; // jshint ;_;


    /* Paginator PUBLIC CLASS DEFINITION
     * ================================= */

    /**
     * Boostrap Paginator Constructor
     *
     * @param element element of the paginator
     * @param options the options to config the paginator
     *
     * */
    var BootstrapPaginator = function (element, options) {
        this.init(element, options);
    },
        old = null;

    BootstrapPaginator.prototype = {

        /**
         * Initialization function of the paginator, accepting an element and the options as parameters
         *
         * @param element element of the paginator
         * @param options the options to config the paginator
         *
         * */
        init: function (element, options) {

            this.$element = $(element);

            this.setOptions(options);
        },

        /**
         * Update the properties of the paginator element
         *
         * @param options options to config the paginator
         * */
        setOptions: function (options) {
            this.options = $.extend({}, (this.options || $.fn.bootstrapPaginator.defaults), options);
            this.currentPage = parseInt(this.options.currentPage, 10);   //setup the current page property
            this.lastPage = parseInt(this.currentPage, 10);  //setup the lastPage property
            this.totalPages = parseInt(this.options.totalPages, 10);  //setup the total pages property.
            this.numberOfPages = parseInt(this.options.numberOfPages, 10); //setup the numberOfPages to be shown

            this.listen();

            //render the paginator
            this.render();

        },

        /**
         * Sets up the events listeners. Currently the pageclicked and pagechanged events are linked if available.
         *
         * */
        listen: function () {

            this.$element.off("page-clicked");

            this.$element.off("page-changed");// unload the events for the element

            if (typeof (this.options.onPageClicked) === "function") {
                this.$element.bind("page-clicked", this.options.onPageClicked);
            }

            if (typeof (this.options.onPageChanged) === "function") {
                this.$element.on("page-changed", this.options.onPageChanged);
            }

        },


        /**
         *
         *  Destroys the paginator element, it unload the event first, then empty the content inside.
         *
         * */
        destroy: function () {

            this.$element.off("page-clicked");

            this.$element.off("page-changed");

            this.$element.removeData('bootstrapPaginator');

            this.$element.empty();

        },

        /**
         * Shows the page
         *
         * */
        show: function (page) {

            this.lastPage = this.currentPage;

            this.currentPage = parseInt(page, 10);

            this.$element.trigger("page-changed", [this.lastPage, this.currentPage]);

            this.render();

        },

        /**
         * Shows the next page
         *
         * */
        showNext: function () {
            var pages = this.getPages();

            if (pages.next) {
                this.show(pages.next);
            }

        },

        /**
         * Shows the previous page
         *
         * */
        showPrevious: function () {
            var pages = this.getPages();

            if (pages.prev) {
                this.show(pages.prev);
            }

        },

        /**
         * Shows the first page
         *
         * */
        showFirst: function () {
            var pages = this.getPages();

            if (pages.first) {
                this.show(pages.first);
            }

        },

        /**
         * Shows the last page
         *
         * */
        showLast: function () {
            var pages = this.getPages();

            if (pages.last) {
                this.show(pages.last);
            }

        },

        /**
         * Internal on page item click handler, when the page item is clicked, change the current page to the corresponding page and
         * trigger the pageclick event for the listeners.
         *
         *
         * */
        onPageItemClicked: function (event) {

            var type = event.data.type,
                page = event.data.page;

            this.$element.trigger("page-clicked", [event, type, page]);

            //show the corresponding page and retrieve the newly built item related to the page clicked before for the event return
            switch (type) {

            case "first":
                this.showFirst();
                break;
            case "prev":
                this.showPrevious();
                break;
            case "next":
                this.showNext();
                break;
            case "last":
                this.showLast();
                break;
            case "page":
                this.show(page);
                break;
            }

        },

        /**
         * Renders the paginator according to the internal properties and the settings.
         *
         *
         * */
        render: function () {

            //fetch the container class and add them to the container
            var containerClass = this.getValueFromOption(this.options.containerClass, this.$element),
                pages = this.getPages(),
                listContainer = $("<ul></ul>"),
                listContainerClass =  this.getValueFromOption(this.options.listContainerClass, listContainer),
                first = null,
                prev = null,
                next = null,
                last = null,
                p = null,
                i = 0;



            this.$element.addClass(containerClass);

            //empty the outter most container then add the listContainer inside.
            this.$element.empty();

            this.$element.append(listContainer);

            listContainer.addClass(listContainerClass);

            //update the page element reference
            this.pageRef = [];

            if (pages.first) {//if the there is first page element
                first = this.buildPageItem("first", pages.first);

                if (first) {
                    listContainer.append(first);
                }

            }

            if (pages.prev) {//if the there is previous page element

                prev = this.buildPageItem("prev", pages.prev);

                if (prev) {
                    listContainer.append(prev);
                }

            }


            for (i = 0; i < pages.length; i = i + 1) {//fill the numeric pages.

                p = this.buildPageItem("page", pages[i]);

                if (p) {
                    listContainer.append(p);
                }
            }

            if (pages.next) {//if there is next page

                next = this.buildPageItem("next", pages.next);

                if (next) {
                    listContainer.append(next);
                }
            }

            if (pages.last) {//if there is last page

                last = this.buildPageItem("last", pages.last);

                if (last) {
                    listContainer.append(last);
                }
            }
        },

        /**
         *
         * Creates a page item base on the type and page number given.
         *
         * @param page page number
         * @param type type of the page, whether it is the first, prev, page, next, last
         *
         * @return the constructed page element
         * */
        buildPageItem: function (type, page) {

            var itemContainer = $("<li></li>"),//creates the item container
                itemContent = $("<a></a>"),//creates the item content
                text = "",
                title = "",
                itemContainerClass = this.getValueFromOption(this.options.itemContainerClass, type, page, this.currentPage),
                itemContentClass = this.getValueFromOption(this.options.itemContentClass, type, page, this.currentPage),
                tooltipOpts = null;


            switch (type) {

            case "first":
                if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) { return; }
                text = this.getValueFromOption(this.options.itemTexts, type, page, this.currentPage);
                title = this.getValueFromOption(this.options.tooltipTitles, type, page, this.currentPage);
                break;
            case "last":
                if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) { return; }
                text = this.getValueFromOption(this.options.itemTexts, type, page, this.currentPage);
                title = this.getValueFromOption(this.options.tooltipTitles, type, page, this.currentPage);
                break;
            case "prev":
                if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) { return; }
                text = this.getValueFromOption(this.options.itemTexts, type, page, this.currentPage);
                title = this.getValueFromOption(this.options.tooltipTitles, type, page, this.currentPage);
                break;
            case "next":
                if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) { return; }
                text = this.getValueFromOption(this.options.itemTexts, type, page, this.currentPage);
                title = this.getValueFromOption(this.options.tooltipTitles, type, page, this.currentPage);
                break;
            case "page":
                if (!this.getValueFromOption(this.options.shouldShowPage, type, page, this.currentPage)) { return; }
                text = this.getValueFromOption(this.options.itemTexts, type, page, this.currentPage);
                title = this.getValueFromOption(this.options.tooltipTitles, type, page, this.currentPage);
                break;
            }

            itemContainer.addClass(itemContainerClass).append(itemContent);

            itemContent.addClass(itemContentClass).html(text).on("click", null, {type: type, page: page}, $.proxy(this.onPageItemClicked, this));

            if (this.options.pageUrl) {
                itemContent.attr("href", this.getValueFromOption(this.options.pageUrl, type, page, this.currentPage));
            }

            if (this.options.useBootstrapTooltip) {
                tooltipOpts = $.extend({}, this.options.bootstrapTooltipOptions, {title: title});

                itemContent.tooltip(tooltipOpts);
            } else {
                itemContent.attr("title", title);
            }

            return itemContainer;

        },

        /**
         * Gets an array that represents the current status of the page object. Numeric pages can be access via array mode. length attributes describes how many numeric pages are there. First, previous, next and last page can be accessed via attributes first, prev, next and last. Current attribute marks the current page within the pages.
         *
         * @return object output objects that has first, prev, next, last and also the number of pages in between.
         * */
        getPages: function () {

            var totalPages = this.totalPages,// get or calculate the total pages via the total records
                pageStart = (this.currentPage % this.numberOfPages === 0) ? (parseInt(this.currentPage / this.numberOfPages, 10) - 1) * this.numberOfPages + 1 : parseInt(this.currentPage / this.numberOfPages, 10) * this.numberOfPages + 1,//calculates the start page.
                output = [],
                i = 0,
                counter = 0;

            pageStart = pageStart < 1 ? 1 : pageStart;//check the range of the page start to see if its less than 1.

            if (this.currentPage > totalPages || this.currentPage < 1) {// if the current page is out of range, throw exception.

                throw "Current page out of range";
            }

            for (i = pageStart, counter = 0; counter < this.numberOfPages && i <= totalPages; i = i + 1, counter = counter + 1) {//fill the pages
                output.push(i);
            }

            if (this.currentPage > 1) {//add the first when the current page leaves the 1st page.
                output.first = 1;
            } else {
                output.first = null;
            }

            if (this.currentPage > 1) {// add the previous when the current page leaves the 1st page
                output.prev = this.currentPage - 1;
            } else {
                output.prev = null;
            }

            if (this.currentPage < totalPages) {// add the next page when the current page doesn't reach the last page
                output.next = this.currentPage + 1;
            } else {
                output.next = null;
            }

            if (this.currentPage < totalPages) {// add the last page when the current page doesn't reach the last page
                output.last = totalPages;
            } else {
                output.last = null;
            }

            output.current = this.currentPage;//mark the current page.

            return output;

        },

        /**
         * Gets the value from the options, this is made to handle the situation where value is the return value of a function.
         *
         * */
        getValueFromOption: function (value) {

            var output = null,
                args = Array.prototype.slice.call(arguments, 1);

            if (typeof value === 'function') {
                output = value.apply(this, args);
            } else {
                output = value;
            }

            return output;

        }

    };


    /* TYPEAHEAD PLUGIN DEFINITION
     * =========================== */

    old = $.fn.bootstrapPaginator;

    $.fn.bootstrapPaginator = function (option) {

        var args = arguments,
            result = null;

        $(this).each(function (index, item) {
            var $this = $(item),
                data = $this.data('bootstrapPaginator'),
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data('bootstrapPaginator', (data = new BootstrapPaginator(this, options)));
                return;
            }

            if (typeof option === 'string') {

                if (data[option]) {
                    result = data[option].apply(data, Array.prototype.slice.call(args, 1));
                } else {
                    throw "Method " + option + " does not exist";
                }

            } else {
                result = data.setOptions(option);
            }
        });

        return result;

    };

    $.fn.bootstrapPaginator.defaults = {
        containerClass: "pagination",
        listContainerClass: "",
        itemContainerClass: function (type, page, current) {
            return (page === current) ? "active" : "";
        },
        itemContentClass: function (type, page, current) {
            return "";
        },
        currentPage: 1,
        numberOfPages: 5,
        totalPages: 1,
        pageUrl: function (type, page, current) {
            return null;
        },
        onPageClicked: null,
        onPageChanged: null,
        useBootstrapTooltip: false,
        shouldShowPage: true,
        itemTexts: function (type, page, current) {
            switch (type) {
            case "first":
                return "<<";
            case "prev":
                return "<";
            case "next":
                return ">";
            case "last":
                return ">>";
            case "page":
                return page;
            }
        },
        tooltipTitles: function (type, page, current) {

            switch (type) {
            case "first":
                return "Go to first page";
            case "prev":
                return "Go to previous page";
            case "next":
                return "Go to next page";
            case "last":
                return "Go to last page";
            case "page":
                return "Go to page " + page;
            }
        },
        bootstrapTooltipOptions: {
            animation: true,
            html: false,
            placement: 'top',
            selector: false,
            title: "",
            container: false
        }
    };

    $.fn.bootstrapPaginator.Constructor = BootstrapPaginator;



}(window.jQuery));
