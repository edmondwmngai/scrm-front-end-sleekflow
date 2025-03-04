(function ($, window) {
    'use strict';

    $.fn.jConfirmAction = function (options) {

        //Set default options
        var defaults = {
            question: 'Are You Sure ?',
            yesText: 'Yes',
            noText: 'No',
            confirm: false,//yes callback
            cancel: false, //no callback
        };

        options = $.extend(defaults, options);

        this.bind('click.jConfirmAction', function (evt) {

            //Prevent default events
            evt.stopPropagation();
            evt.preventDefault();

            var $this = $(this),
                $body = $('body');

            //Build up html
            var $popUP = $('<div class="jc-box"><span class="jc-question">' + options.question + '</span><br/> <div class="jc-btn-wrap"><span class="jc-yes">' + options.yesText + '</span><span class="jc-no">' + options.noText + "</span></div></div>");

            //Some dynamic css
            fixPosition($popUP);
            $popUP.animate({opacity: .96}, 300);

            //Append html next to current item
            $body.append($popUP);

            //Unbind previous and bind new
            $('.jc-yes', $popUP).unbind('click.jConfirmAction').bind('click.jConfirmAction', function () {
                //call callback function
                if ($.isFunction(options.confirm)) {
                    options.confirm($this);
                } else {
                    //else redirect
                    window.location = $this.attr('href')
                }
                removePopUp();
            });

            //NO Button click event
            $('.jc-no', $popUP).unbind('click.jConfirmAction').bind('click.jConfirmAction', function () {
                if ($.isFunction(options.cancel)) {
                    options.cancel($this);
                }
                removePopUp()
            });

            //Change dialog position on resize and scroll event
            $(window).on('resize scroll', function (e) {
                var jcBox = $('.jc-box:visible');
                if (jcBox.length) {
                    fixPosition(jcBox);
                }
            });

            //Hide any opened dialog if user clicks on body but not on dialog itself
            $body.bind('mouseup', function (event) {
                var jcBox = $('.jc-box:visible');

                if (jcBox.is(event.target) === false && jcBox.has(event.target).length === 0 && jcBox.length) {
                    removePopUp();
                }
            });

            //Add some dynamic css
            function fixPosition($item) {
                $item.css({
                    top: $this.offset().top - $(window).scrollTop() + 40 + 'px',
                    left: $this.offset().left - $(window).scrollLeft() - 100 + 'px'
                })
            }

            //Remove popup from dom
            function removePopUp() {
                $popUP.fadeOut(300, function () {
                    $popUP.remove();
                })
            }

        })
    }
})
(jQuery, window);