//var TheSlideshow = new Slideshow('.slideshow', '.slide-outer', '.slide-container', '.slideshow-card', 640, 1024, 3, 2, 1);

// SLIDESHOW CLASS
function Slideshow(slideshowSelector, outerContainerSelector, containerSelector, cardSelector, medSmallBreak, largeMedBreak, largeNumCards, medNumCards, smallNumCards, animationTime) {
    var _self = this;
    this.SlideshowSelector = slideshowSelector;
    this.OuterContainerSelector = outerContainerSelector;
    this.ContainerSelector = containerSelector;
    this.CardSelector = cardSelector;
    this.MedSmallBreak = medSmallBreak;
    this.LargeMedBreak = largeMedBreak;
    this.AnimationTime = (animationTime ? animationTime : 300);

    this.LargeContainer = new Object(), this.MedContainer = new Object(), this.SmallContainer = new Object();

    this.setContainerVals = function (container, numCards) {
        switch (numCards) {
            case 4:
                container.columnWidth = 2;
                container.columnOffset = 0;
                container.containerLeft = "25%";
                container.cardWidth = "25%";
                container.rowWidth = "150%";
                break;
            case 3:
                container.columnWidth = 2;
                container.columnOffset = 2;
                container.containerLeft = "66.666667%";
                container.cardWidth = "33.3333%";
                container.rowWidth = "200%";
                break;
            case 2:
                container.columnWidth = 3;
                container.columnOffset = 0;
                container.containerLeft = "50%";
                container.cardWidth = "50%";
                container.rowWidth = "200%";
                break;
            case 1:
                container.columnWidth = 4;
                container.columnOffset = 0;
                container.containerLeft = "100%";
                container.cardWidth = "100%";
                container.rowWidth = "300%";
                break;
        }
        container.NumCards = numCards;
    }

    this.setContainerVals(this.LargeContainer, largeNumCards);
    this.setContainerVals(this.MedContainer, medNumCards);
    this.setContainerVals(this.SmallContainer, smallNumCards);

    this.CurContainer;// = this.LargeContainer;
    this.CardIndex = 0;
    this.NumCards;

    this.CardsShowing;
    this.CardsArray;
    this.EmptyCardLeft;
    this.EmptyCardRight;

    this.LeftMostCard = 0;

    this.SizeEnum = { SMALL: 1, MEDIUM: 2, LARGE: 3 };
    this.CurSize;

    this.slideshowify = function () {
        $(window).resize(function () {
            _self.resizeSlideshow();
        });
        $(document).ready(function () {
            _self.CardsArray = $(_self.CardSelector);

            _self.duplicateCards();

            //_self.assembleCards();
            _self.resizeSlideshow();

            _self.initSliding();
        });
        //this.resizeSlideshow();	
    }

    this.duplicateCards = function () {
        var slideshowRow = $(this.SlideshowSelector + ".row");
        var numCards = this.CardsArray.length;
        this.NumCards = numCards;

        $(this.CardsArray[numCards - 1]).clone().prependTo(slideshowRow);
        for (var i = 0; i < numCards; i++) {
            $(this.CardsArray[i]).clone().appendTo(slideshowRow);
        }
    }

    this.assembleCards = function () {
        _self.CardsArray = $(_self.CardSelector);

        var curWidth = window.innerWidth;
        var first = true;

        if (curWidth > largeMedBreak)
            _self.CurSize = _self.SizeEnum.LARGE;
        else if (curWidth > medSmallBreak)
            _self.CurSize = _self.SizeEnum.MEDIUM;
        else
            _self.CurSize = _self.SizeEnum.SMALL;

        for (var i = 0; i < _self.CardsArray.length; i++) {
            $(_self.CardsArray[i]).removeClass('large-offset-' + _self.LargeContainer.columnOffset); //remove by default
            $(_self.CardsArray[i]).removeClass('medium-offset-' + _self.MedContainer.columnOffset); //remove by default
            $(_self.CardsArray[i]).removeClass('small-offset-' + _self.SmallContainer.columnOffset); //remove by default
            $(_self.CardsArray[i]).removeClass('ghosted'); //remove by default
            $(_self.CardsArray[i]).removeClass('ghosted'); //remove by default
            $(_self.CardsArray[i]).css('opacity', ''); //remove element opacity settings after animation

            if ((i >= _self.CardIndex) && (i < (_self.CardIndex + _self.CurContainer.NumCards + 2))) {
                $(_self.CardsArray[i]).addClass('large-' + _self.LargeContainer.columnWidth)
                $(_self.CardsArray[i]).addClass('medium-' + _self.MedContainer.columnWidth)
                $(_self.CardsArray[i]).addClass('small-' + _self.SmallContainer.columnWidth)

                if (first) {
                    first = false;
                    $(_self.CardsArray[i]).addClass('large-offset-' + _self.LargeContainer.columnOffset);
                    $(_self.CardsArray[i]).addClass('medium-offset-' + _self.MedContainer.columnOffset);
                    $(_self.CardsArray[i]).addClass('small-offset-' + _self.SmallContainer.columnOffset);

                    $(_self.CardsArray[i]).addClass('ghosted');
                }

                if (i == _self.CardIndex + _self.CurContainer.NumCards + 1) {
                    $(_self.CardsArray[i]).addClass('ghosted');
                }

                $(_self.CardsArray[i]).addClass('columns');
                $(_self.CardsArray[i]).removeClass('card-hide');
            }
            else {
                $(_self.CardsArray[i]).removeClass('columns');
                $(_self.CardsArray[i]).addClass('card-hide');
            }
        }

        $(_self.SlideshowSelector + ".row").css('width', _self.CurContainer.rowWidth);
        $(_self.SlideshowSelector).css('max-width', _self.CurContainer.rowWidth);
        $(_self.SlideshowSelector).css('left', "-" + _self.CurContainer.containerLeft);
        //$(_self.ContainerSelector).css('width', _self.LargeContainer.containerWidth);
    }

    this.isMobile = function () {
        // need to implement this.	
        var check = false;
        (function (a, b) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }

    this.initSliding = function () {
        if (!this.isMobile()) {
            this.drawArrows();
        }
        else {
            this.drawArrows();
            this.enableSwipes();
        }
    }

    this.enableSwipes = function () {
        // do we have jquery mobile??
        if ($.mobile) {
            //jq mobile loaded
        } else {
            // let's include it. this doesn't work quite right yet.
            //loadjscssfile("http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js","js");
        }

        $(this.SlideshowSelector).on("swiperight", function () {
            _self.SlideRight();
        });
        $(this.SlideshowSelector).on("swipeleft", function () {
            _self.SlideLeft();
        });
    }

    this.drawArrows = function () {
        var rightArrowHtml = "<div class='slideshow-arrow' id='slideshow-arrow-right'></div>";

        $(this.OuterContainerSelector).append(rightArrowHtml);
        $("#slideshow-arrow-right").click(function () {
            //_self.SlideRight();
            _self.SlideLeft();
        });

        var leftArrowHtml = "<div class='slideshow-arrow' id='slideshow-arrow-left'></div>";

        $(this.OuterContainerSelector).append(leftArrowHtml);
        $("#slideshow-arrow-left").click(function () {
            //_self.SlideLeft();
            _self.SlideRight();
        });
    }

    this.resizeSlideshow = function () {
        var windowSize = this.getMediaState();
        if (windowSize == this.CurSize) return; //short-circuit if size has not changed;

        this.CurSize = windowSize;

        switch (windowSize) {
            case this.SizeEnum.LARGE:
                this.CurContainer = this.LargeContainer;
                break;
            case this.SizeEnum.MEDIUM:
                this.CurContainer = this.MedContainer;
                break;
            case this.SizeEnum.SMALL:
                this.CurContainer = this.SmallContainer;
                break;
        }

        this.assembleCards();

        /*var cardWidth = $(this.SlideshowSelector).width()/this.getMediaState();
		$(this.CardSelector).css('width', cardWidth + 'px');
		var containerWidth = $(this.CardSelector).children().length*$(this.CardSelector).width();
		$(this.ContainerSelector).css('width',containerWidth + 'px');
		// need to change marginLeft. do we know what the size was?
		var newMargin = -cardWidth*this.LeftMostCard;
		$(this.ContainerSelector).css("margin-left",newMargin);*/
    }

    this.SlideLeft = function () {
        $(this.CardsArray[this.CardIndex + 1]).animate({
            opacity: '-=' + 1
        }, this.AnimationTime);

        $(this.CardsArray[this.CardIndex + this.CurContainer.NumCards + 1]).animate({
            opacity: '+=' + 1
        }, this.AnimationTime);

        this.CardIndex = (this.CardIndex + 1) % this.NumCards;

        $(this.SlideshowSelector).animate({
            left: '-=' + this.CurContainer.cardWidth
        }, this.AnimationTime, "swing", this.assembleCards);
    }

    this.SlideRight = function () {
        $(this.CardsArray[this.CardIndex + this.CurContainer.NumCards]).animate({
            opacity: '-=' + 1
        }, this.AnimationTime);

        $(this.CardsArray[this.CardIndex]).animate({
            opacity: '+=' + 1
        }, this.AnimationTime);

        this.CardIndex = (this.CardIndex + this.NumCards - 1) % this.NumCards;

        $(this.SlideshowSelector).animate({
            left: '+=' + this.CurContainer.cardWidth
        }, this.AnimationTime, "swing", this.assembleCards);
    }
    // returns 1 - small, 2 - medium, 3 - large
    this.getMediaState = function () {
        if (window.innerWidth > this.LargeMedBreak) return 3;
        if (window.innerWidth > this.MedSmallBreak) return 2;
        return 1;
    }

    this.slideshowify(this.ContainerSelector);
}

// HELPER FUNCTION

function loadjscssfile(filename, filetype) {
    if (filetype == "js") { //if filename is a external JavaScript file
        var fileref = document.createElement('script')
        fileref.setAttribute("type", "text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype == "css") { //if filename is an external CSS file
        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }

    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}