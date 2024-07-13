import { Injectable } from '@angular/core';

//third-party
import { ToastrService } from 'ngx-toastr';
// import { NgxSpinnerService } from "ngx-spinner"; 
import { NgxUiLoaderService } from "ngx-ui-loader";
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    constructor(
        private toastr: ToastrService,
        private spinner: NgxUiLoaderService,
    ) { }

    showSuccess(message: string) {
        this.toastr.success(message);
    }

    showError(msg: string) {
        msg = msg ? msg : 'Something went wrong';
        this.toastr.error(msg);
    }
    showInfo(msg: string) {
        msg = msg ? msg : 'Something went wrong';
        this.toastr.info(msg);
    }

    showSpinner() {
        this.spinner.start();
    }

    showSpinnerWithId(name: string) {
        this.spinner.startBackground(name)
    }

    hideSpinnerWithId(name: string) {
        this.spinner.stopBackground(name)
    }

    hideSpinner() {
        this.spinner.stop();
    }

    showErrorMessage(error: any) {
        if (error.error && error.error.message) {
            this.showError(error.error.message);
        } else {
            this.showError('');
        }
    }
    setKeyToLS(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        let password = group.get('password')?.value;
        let confirmpassword = group.get('password_confirmation')?.value
        return password === confirmpassword ? null : { notSame: true }
    }

    copyText(val: string, message: string) {
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        this.showSuccess(message);
    }

    getExactDate(date: any) {
        return date;
        //DST Strt if use ()
        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var firstOfMarch = new Date(currentYear, 2, 1);
        var daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
        var secondSundayInMarch = firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
        var dstStartDate = new Date(currentYear, 2, secondSundayInMarch);
        // DST End
        var firstOfNovember = new Date(currentYear, 10, 1);
        var daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
        var firstSundayInNovember = firstOfNovember.getDate() + daysUntilFirstSundayInNov;
        var dstEndDate = new Date(currentYear, 10, firstSundayInNovember);
        const dt = new Date(date)
        if (date > dstStartDate && date < dstEndDate) {
            return dt.setHours(dt.getHours() + 1);
        } else {
            return dt.setHours(dt.getHours() - 1);

        }
    }
}
