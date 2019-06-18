declare var window: any;
import i18n from "./i18n/i18n";
import * as Pikaday from "@core/assets/js/vendor/pikaday";
import * as utility from "@core/assets/js/components/utility";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 * Profile
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class DatePicker {
    private element: HTMLElement;
    private dateFormat = "MM/DD/YYYY";
    private currentDate = new Date();
    private yearMinus18 = this.currentDate.getFullYear() - 18;
    private currentMonth = this.currentDate.getMonth();
    private currentDay = this.currentDate.getDate();

    constructor(element: HTMLElement, attachments: {}) {
        this.element = element;
    }

    init() {
        this.dateFormat = this.formatFromPHPtoJS(
            this.element.querySelector("#MyProfileForm_birthdate").getAttribute("date-format"),
        );

        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const options = {
            field: this.element.querySelector("#MyProfileForm_birthdate"),
            format: this.dateFormat,
            i18n: i18n[Router.getLanguage()] || i18n.en,
            toString: (date, format) => {
                // return Date.parse(date, format);
                return this.parseStringDate(date, format);
            },
            parse: (dateString, format) => {
                // commented out because they don't want to autoparse date on change
                return utility.parseDate(dateString, format);
            },
            defaultDate: new Date(this.yearMinus18, this.currentMonth, this.currentDay),
            maxDate: new Date(this.yearMinus18, this.currentMonth, this.currentDay),
            yearRange: [1901, this.yearMinus18],
        };

        if (!ios) {
            new Pikaday(options);
        } else {
            // Create element for ios that will handle the native date
            const input = document.createElement("input");
            const inputDate: HTMLFormElement = this.element.querySelector("#MyProfileForm_birthdate");

            input.style.cursor = "pointer";
            utility.addClass(input, "ios-dob-field");
            utility.addClass(inputDate, "ios-dob-field-main");
            input.setAttribute("type", "date");
            inputDate.setAttribute("readonly", "readonly");
            inputDate.parentNode.insertBefore(input, this.element.querySelector("#MyProfileForm_birthdate"));
            utility.listen(this.element.querySelector(".ios-dob-field"), "change", (event, src: any) => {
                const formattedDate = utility.parseDate(input.value, "YYYY/MM/DD");
                inputDate.value = this.parseStringDate(formattedDate, this.dateFormat);
                inputDate.blur();
            });
        }
    }

    private parseStringDate(date, format) {
        const dateString = [];
        let day = String(date.getDate());
        day = day.length === 1 ? "0" + day : day;
        let month = String(date.getMonth() + 1);
        month = month.length === 1 ? "0" + month : month;
        const year = date.getFullYear();
        const dateArrayFormat = format.match(/([a-zA-Z]+)/g);

        for (let i = 0; i <= dateArrayFormat.length - 1; i++) {
            if (dateArrayFormat[i] === "YYYY") {
                dateString[i] = year;
            }

            if (dateArrayFormat[i] === "MM") {
                dateString[i] = month;
            }

            if (dateArrayFormat[i] === "DD") {
                dateString[i] = day;
            }
        }

        return dateString[0] + "/" + dateString[1] + "/" + dateString[2];
    }

    private formatFromPHPtoJS(format) {
        let result = "";
        const currentFormat = format.split("/");

        for (let i = 0; i < currentFormat.length; i++) {
            switch (currentFormat[i].toLowerCase()) {
                case "m":
                    result += "MM";
                    break;
                case "d":
                    result += "DD";
                    break;
                case "y":
                    result += "YYYY";
                    break;
                default:
                    break;
            }

            if (i < currentFormat.length - 1) {
                result += "/";
            }
        }

        return result;
    }
}
