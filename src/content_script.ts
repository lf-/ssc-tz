import * as luxon from 'luxon';

declare global {
    interface Window { luxon: any; }

    interface Element {
        timeChanged: boolean
    }
}


window.luxon = luxon

const VAN_TZ = luxon.IANAZone.create('America/Vancouver')
// This lets you override the timezone to ones that will cause edge cases :)
//const LOCAL_TZ = luxon.IANAZone.create('America/Noronha')
const LOCAL_TZ = new luxon.LocalZone()

function convertPopup() {
    const dom = document.querySelectorAll('div#ttpopup .tt-header-mini')
    dom.forEach(element => {
        // throw away headers like Mon Tue, nbsp, etc
        if (!element.textContent.match(/^\d+$/) || element.timeChanged) {
            return;
        }
        // I don't know if this is actually a problem but I definitely don't
        // want to double localize times
        element.timeChanged = true
        const van_time = element.textContent
        const time = fromVanTime(van_time, 'Hmm')
        element.textContent = time.toFormat('Hmm')
    });
}

/**
 * Returns a DateTime object for the given time in Vancouver time switched to
 * the local timezone
 * @param t time in Vancouver time
 * @param fmt format string, see the Luxon docs for more
 */
function fromVanTime(t: string, fmt: string): luxon.DateTime {
    // for safety set the locale; don't know if it is hardcoded en-US by default
    return luxon.DateTime.fromFormat(t, fmt, {zone: VAN_TZ, locale: 'en-US'}).setZone(LOCAL_TZ)
}

function convertPage() {
    // debugger;
    const dom = document.querySelectorAll('table.section-summary > tbody > tr')
    dom.forEach(tr => {
        // now convert some times

        // grab a list of all the days
        const days = tr.children[5].textContent.split(' ').filter(x => x)
        const start = tr.children[6].textContent
        const end = tr.children[7].textContent

        // is the row empty? e.g. a waiting list or continuation row
        if (days.length === 0) {
            return;
        }

        const FMT = 'ccc H:mm'

        // for each day, find a time for it in the local tz
        const local_times = days.map(d => {
            // get rid of the star so our datetime code doesn't crash
            d = d.replace(/\*$/, '')
            const timeStartS = `${d} ${start}`
            const timeEndS = `${d} ${end}`
            const timeStart = fromVanTime(timeStartS, FMT)
            const timeEnd = fromVanTime(timeEndS, FMT)
            return [timeStart, timeEnd]
        })

        // clear the days field
        tr.children[5].textContent = ''

        // we need to remake the days array in the local tz
        local_times.forEach(([s, e], idx) => {
            let orig = days[idx]
            const star = orig.endsWith('*')
            orig = orig.replace(/\*$/, '')

            const startDay = s.toFormat('ccc')
            const endDay = e.toFormat('ccc')

            let out: string
            if (startDay !== endDay) {
                out = `${startDay}-${endDay}`
            } else {
                out = `${startDay}`
            }

            // make a new element
            const elem = document.createElement('span')
            elem.textContent = out + (star ? '*' : '')
            elem.style.marginRight = '1ch'
            if (out !== orig) {
                // we changed the day, highlight it in red
                elem.style.color = 'red'
            }

            tr.children[5].appendChild(elem)
        });

        // next, change the times
        // TODO: bug? we only look at the first time which might screw us if
        // DST happens mid week?

        [tr.children[6], tr.children[7]].forEach((el, idx) => {
            const FMT = 'H:mm'
            const localTime = local_times[0][idx]
            const timeLocal = localTime.toFormat(FMT)
            const timeVan = localTime.setZone(VAN_TZ).toFormat(FMT)
            el.textContent = `${timeLocal} [V: ${timeVan}]`
        })
    })
}

(() => {
    convertPage()
    const elem = document.getElementById('ttpopup')
    const observer = new MutationObserver(() => {
        // debugger;
        // disconnect the observer while we're messing stuff up
        observer.disconnect()
        convertPopup()
        observer.observe(elem, {subtree: true, childList: true})
    })
    observer.observe(elem, {subtree: true, childList: true})
})();