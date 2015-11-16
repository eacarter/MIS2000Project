var pulseInterval;

var cgMode = "fix";
var enableChange = false;
var SCREEN_MODE_ENUM = { "LARGE": 3, "MEDIUM": 2, "SMALL": 1 };
var SCREEN_MODE_NAME = { 1: "small", 2: "medium", 3: "large" };
var screenMode;
var frames, curFrameIndex, isScrolling = false;
var SCROLL_TIME = 700;
var SCROLL_DIST = 150;
var SCROLL_INT = 50;
var sparkx, sparky, endx, initSparkx;
var curXD = 5;
var segments = new Array();
var mInt;
//var curChange = .05, lightMax = 1.8, lightMin = .9;
var curChange = 1, lightMax = 50, lightMin = 30;

$(document).ready(function () {
    screenMode = getScreenMode();

    if (screenMode == SCREEN_MODE_ENUM.LARGE) {
        pulseInterval = window.setInterval(function () { pulseLight(); }, 50);
    }

    findSegments();

    initSparkx = parseInt($('#spark').attr('cx'));
    sparkx = initSparkx;

    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel"; //FF doesn't recognize mousewheel as of FF3.x
    $(document).bind(mousewheelevt, function (e) {
        var evt = window.event || e //equalize event object     
        evt = evt.originalEvent ? evt.originalEvent : evt; //convert to originalEvent if possible               
        var delta = evt.detail ? evt.detail * (-40) : evt.wheelDelta //check for detail first, because it is used by Opera and FF
        if (delta > 0) {
            prevFrame();
        }
        else {
            nextFrame();
        }

        return false;
    });

    $(window).bind('swiperight', prevFrame);
    $(window).bind('swipeleft', nextFrame);
    $(window).bind('swipedown', nextFrame);
    $(window).bind('swipeup', nextFrame);

    document.ontouchmove = function (e) { e.preventDefault() };

    $(window).scroll(function () {
        timedMove();
    });

    $(window).resize(function () {
        frameHandleResize();
    });

    $(window).bind('resize', verifyState);

    findFrames();

    var icons = $('.cgIcon');
    for (var i = 0; i < icons.length; i++) {
        $(icons[i]).attr('index', i % frames.length);
    }

    $('.cgIcon').click(function () {
        jumpToFrame(this);
    });
});

$(window).load(function () {
    $('.fill-text-width').textfill({ maxFontPixels: 200, widthOnly: true, complete: function () { $('.fill-text-width').removeClass('transparent'); } });
});

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function () {
        var last = now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function () {
        context = this;
        args = arguments;
        timestamp = now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

now = Date.now || function () {
    return new Date().getTime();
};

refillText = debounce(function () {
    $('.fill-text-width').textfill({ maxFontPixels: 200, widthOnly: true });
}, 500);

findFrames = function () {
    curFrameIndex = 0;
    frames = $('div.frame');
};

frameHandleResize = function () {
    var frameSize = $(frames[0]).innerWidth();
    $('#mainContent').css('left', "-" + (frameSize * curFrameIndex) + "px");

    refillText();
    //$('.fill-text-width').textfill({ maxFontPixels: 200, widthOnly: true });
    //alert('resized?');
};



restoreSlides = function () {
    frames.css('margin-left', '');
    frames.css('margin-right', '');
    frames.css('display', '');

    var frameSize = $(frames[0]).innerWidth();
    $('#mainContent').css('left', "-" + (frameSize * curFrameIndex) + "px");
};

verifyState = function () {
    if (isScrolling) return;

    resetSpark();

    var curScreenMode = getScreenMode();

    if (curScreenMode == screenMode) return;

    hideScreenMode(screenMode);

    screenMode = curScreenMode;

    showScreenMode(screenMode);
};

resetSpark = function () {
    var adjSparkx;

    //reset sparkx
    adjSparkx = initSparkx + (SCROLL_DIST * curFrameIndex);

    if (sparkx == adjSparkx) return;

    setCgPosition(curFrameIndex);
};

getScreenMode = function () {
    var width = window.innerWidth;

    if (width > 1024) {
        return SCREEN_MODE_ENUM.LARGE;
    } else if (width > 640) {
        return SCREEN_MODE_ENUM.MEDIUM;
    } else {
        return SCREEN_MODE_ENUM.SMALL;
    }
};

hideScreenMode = function (screenMode) {
    if (screenMode == SCREEN_MODE_ENUM.LARGE) {
        disableCardiogram = true;
        window.clearInterval(pulseInterval);
    } else {
        //
    }
};

showScreenMode = function (screenMode) {
    if (screenMode == SCREEN_MODE_ENUM.LARGE) {
        pulseInterval = window.setInterval(function () { pulseLight(); }, 50);
    } else {

    }
};

jumpToFrame = function (elem) {
    if (isScrolling) return;

    var jumpFrame = parseInt($(elem).attr('index'));
    var frameSize = $(frames[0]).innerWidth();
    var frameDiff;
    if (curFrameIndex == jumpFrame) return;
    isScrolling = true;

    if (curFrameIndex > jumpFrame) {
        frameDiff = curFrameIndex - jumpFrame;

        if (screenMode == SCREEN_MODE_ENUM.LARGE) {
            if (frameDiff == 1) {
                cgToLeft(frameDiff);
                activateIcons(jumpFrame);
            } else {
                activateIcons(jumpFrame);
                setCgPosition(jumpFrame);
            }
        } else {
            activateIcons(jumpFrame);
        }

        var move = $(frames[0]).innerWidth();

        $(frames[jumpFrame]).css('margin-left', (frameSize * (frameDiff - 1)) + "px");
        for (var i = 1; i < frameDiff; i++) {
            $(frames[curFrameIndex - i]).css('display', 'none');
        }

        $('#mainContent').animate({
            left: '+=' + move + 'px'
        }, SCROLL_TIME, "swing", function () { isScrolling = false; restoreSlides(); verifyState(); });
    } else {
        frameDiff = jumpFrame - curFrameIndex;

        if (screenMode == SCREEN_MODE_ENUM.LARGE) {
            if (frameDiff == 1) {
                cgToRight(frameDiff);
                activateIcons(jumpFrame);
            } else {
                activateIcons(jumpFrame);
                setCgPosition(jumpFrame);
            }
        } else {
            activateIcons(jumpFrame);
        }

        var move = $(frames[0]).innerWidth();

        $(frames[jumpFrame]).css('margin-right', (frameSize * (frameDiff - 1)) + "px");
        for (var i = 1; i < frameDiff; i++) {
            $(frames[curFrameIndex + i]).css('display', 'none');
        }

        $('#mainContent').animate({
            left: '-=' + move + 'px'
        }, SCROLL_TIME, "swing", function () { isScrolling = false; restoreSlides(); verifyState(); });
    }

    curFrameIndex = jumpFrame;
};

activateIcons = function (goalIcon) {
    for (var i = 0; i < frames.length; i++) {
        if (i == goalIcon) {
            $('.cgIcon[index=' + i + ']').addClass('current');
        } else {
            $('.cgIcon[index=' + i + ']').removeClass('current');
        }

        if (i <= goalIcon) {
            $('.cgIcon[index=' + i + ']').addClass('active');
        } else {
            $('.cgIcon[index=' + i + ']').removeClass('active');
        }
    }
};

prevFrame = function () {
    if (curFrameIndex == 0) return;
    if (isScrolling) return; //disable concurrent scrolls

    curFrameIndex--;
    isScrolling = true;

    var move = $(frames[0]).innerWidth();

    if (screenMode == SCREEN_MODE_ENUM.LARGE) {
        cgToLeft(1);  //animate cardiogram pulse
    }

    activateIcons(curFrameIndex);

    $('#mainContent').animate({
        left: '+=' + move + 'px'
    }, SCROLL_TIME, "swing", function () { isScrolling = false; restoreSlides(); verifyState(); });
};

nextFrame = function () {
    if (curFrameIndex >= frames.length - 1) return; //don't allow scroll past end of page
    if (isScrolling) return; //disable concurrent scrolls

    curFrameIndex++;
    isScrolling = true;

    var move = $(frames[0]).innerWidth();

    if (screenMode == SCREEN_MODE_ENUM.LARGE) {
        cgToRight(1);  //animate cardiogram pulse
    }

    activateIcons(curFrameIndex);

    $('#mainContent').animate({
        left: '-=' + move + 'px'
    }, SCROLL_TIME, "swing", function () { isScrolling = false; restoreSlides(); verifyState(); });
};

cgToLeft = function (numFrames) {
    //var scrollDist = window.innerWidth * .2;   //hack; hardcoding
    curXD = -1 * SCROLL_DIST / (SCROLL_TIME / SCROLL_INT);  //flip left
    endx = sparkx - (SCROLL_DIST * numFrames);

    mInt = window.setInterval(function () { timedMove(); }, SCROLL_INT);
};

cgToRight = function (numFrames) {
    //var scrollDist = window.innerWidth * .2;   //hack; hardcoding
    curXD = SCROLL_DIST / (SCROLL_TIME / SCROLL_INT);
    endx = sparkx + (SCROLL_DIST * numFrames);

    mInt = window.setInterval(function () { timedMove(); }, SCROLL_INT);
};

$(document).keydown(function (e) {
    switch (e.which) {
        case 37: //up
            prevFrame();
            break;
        case 39: //down
            nextFrame();
            break;
        case 38: //up
            prevFrame();
            break;
        case 40: //down
            nextFrame();
            break;
        case 83: //s
            SCROLL_TIME = parseInt(prompt("Scroll time in milliseconds", SCROLL_TIME));
            break;
        default: return; //exit this handler for other keys
    }

    e.preventDefault();
});

findSegments = function () {
    var lines = $('#cardiogramLines > line');
    segments = new Array();

    for (var i = 0; i < lines.length; i++) {
        segments.push({ x1: parseInt($(lines[i]).attr('x1')), x2: parseInt($(lines[i]).attr('x2')), y1: parseInt($(lines[i]).attr('y1')), y2: parseInt($(lines[i]).attr('y2')) });
    }
};

startMove = function () {
    mInt = window.setInterval(function () { timedMove(); }, 45);
};

endMove = function () {
    window.clearInterval(mInt);
};

timedMove = function () {
    if (Math.abs(sparkx - endx) < Math.abs(curXD)) {
        sparkx = endx;
        window.clearInterval(mInt);
    } else {
        sparkx += curXD;
    }

    fillLineSegments();

    setSparkPos(sparkx);
};

setCgPosition = function (frameIndex) {
    sparkx = initSparkx + (SCROLL_DIST * frameIndex);
    curXD = 0;

    fillLineSegments();
    setSparkPos(sparkx);
};

setSparkPos = function (px) {
    $('#fepointlight').attr('x', px);
    $('#spark').attr('cx', px);
};

fillLineSegments = function () {
    var curClass;

    for (var i = 0; i < segments.length; i++) {
        curClass = $($('#cardiogramLines line')[i]).attr('class');
        if (curClass == 'hide') { continue; }

        if (sparkx > segments[i].x1) { //show if sparkx is greater than left side of line
            $($('#cardiogramLines line')[i]).attr('class', 'red'); //*only* class is 'red'
            //$('#cardiogramLines line')[i].classList.add('red');
            //$('#cardiogramLines line')[i].classList.remove('gray');
        } else {
            $($('#cardiogramLines line')[i]).attr('class', 'gray'); //*only class is 'gray'
            //$('#cardiogramLines line')[i].classList.add('gray');
            //$('#cardiogramLines line')[i].classList.remove('red');
        }
    }
};

moveSpark = function (xd, yd, zd) {
    curx = parseInt($('#fepointlight').attr('x')) + xd;
    cury = parseInt($('#fepointlight').attr('y')) + yd;
    curz = parseInt($('#fepointlight').attr('z')) + zd;
    //$('#spark').attr(curx + 'px',cury + 'px');
    $('#fepointlight').attr('x', curx);
    $('#fepointlight').attr('y', cury);
    $('#fepointlight').attr('z', curz);
    $('#spark').attr('cx', curx);
    $('#spark').attr('cy', cury);
};

pulseLight = function () {
    //var curValue = $('.fediffuselight')[0].diffuseConstant.baseVal;
    var curValue = getSpecularVal();

    if (curValue == null) { window.clearInterval(pulseInterval); return; } //if we fail to retrieve the specular value, remove the interval; incompatible

    if (curChange > 0 && curValue >= lightMax) {
        curChange *= -1;
    }
    else if (curChange < 0 && curValue <= lightMin) {
        curChange *= -1;
    }

    var lights = $('.fediffuselight');
    for (var i = 0; i < lights.length; i++) {
        //lights[i].diffuseConstant.baseVal = curValue + curChange;
        lights[i].specularExponent.baseVal = curValue + curChange;
    }
};

getSpecularVal = function () {
    if ($('.fediffuselight')[0].specularExponent) {
        return $('.fediffuselight')[0].specularExponent.baseVal;
    }
    
    return null;
};