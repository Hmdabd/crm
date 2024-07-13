import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_PATH } from '@constants/api-end-points';
import { Roles, SETTINGS } from '@constants/constants';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import { lastValueFrom, Subscription } from 'rxjs';

@Component({
    selector: 'app-role-list-view',
    templateUrl: './role-list-view.component.html',
    styleUrls: ['./role-list-view.component.scss']
})
export class RoleListViewComponent implements OnInit {
    form!: FormGroup;
    crmform!: FormGroup;
    roleName: string = '';
    roleData: { [key: string]: any } = {};
    crmroleName: string = '';
    crmroleData: { [key: string]: any } = {};
    roleID: string = '';
    roleList: any = [];
    activeId: any = '';
    bool: boolean = false;
    crmbool: boolean = false;
    TestData: any;
    color: any;
    getAllID: Array<any> = [];
    getAllCrmID: Array<any> = [];
    colorSubs!: Subscription;
    tabView: boolean = true;
    manageTabsForCompany:boolean = false;
    userRole: string = '';
    crmUtilityArrayresult: boolean = true;
    constructor(
        private commonService: CommonService,
        private apiService: ApiService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        // this.getRolePermissions();
        // this.initForm();
        this.getUserDetails();
        this.myfunction()
        this.form = this.fb.group({});
        this.crmform = this.fb.group({});
        let params = this.route.snapshot.params;
        if (params && params['id']) {
            this.roleID = params['id'];
            this.getRolePermissions();
            this.getCrmRolePermissions();
        } else {
            this.commonService.showError('');
        }
        // window.addEventListener("scroll", (event) => {
        // let scroll = this.scrollY;
        //   console.log('event',event)
        // });
    }

    //

    getUserDetails(): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                this.getColorOnUpdate();
                this.userRole = ud.role;
                // console.log("userRole", this.userRole);
            this.color = ud?.color;

                
            }
            // 	this.style={fill:ud?.color};
        }
        catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    getColorOnUpdate() {
        this.colorSubs = this.authService.getColor().subscribe((u) => {
            this.getUserDetails();
        });
    }
    get userBaseRoute() {
        return this.authService.getUserRole().toLowerCase();
    }

    //

    /**
     * @description get permission details
     */
    async getRolePermissions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.ROLE_DETAIL + `?role_id=${this.roleID}`, 'role', 'list');
            let response = await lastValueFrom(res$);
            // console.log('res',response.data.permissions)
            if (response && response.data) {
                this.roleName = response?.data?.name;
                this.roleData = response.data.permissions;
                if(response?.data?.manage_permission){
                    this.manageTabsForCompany = true
                }else if (response?.data?.manage_permission === 0){
                    this.manageTabsForCompany = false
                    this.tabView = false;

                }
                // console.log('permission:',response?.data?.manage_permission);
                
                // console.log(this.roleData,'hgdhsgdhsgsdj');
                // console.log(response.data.permissions)
                this.initForm();
                this.initCrmForm();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error && error.error) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }
    //

    /**
     * @description get permission details
     */
    async getCrmRolePermissions() {
        try {
            this.commonService.showSpinner();
            const res$ = this.apiService.getReq(API_PATH.GET_CRM_UTILITIES_ROLES + `?role_id=${this.roleID}`, 'role', 'list');
            let response = await lastValueFrom(res$);
            // console.log('res',response.data.permissions)
            if (response && response.data) {
                // this.roleName = response?.data?.name;
                // this.roleData = response.data.permissions;
                this.crmroleName = response?.data?.name;
                this.crmroleData = response.data.permissions;
                // console.log(this.roleData,'hgdhsgdhsgsdj');
                // console.log(response.data.permissions)
                this.initCrmForm();
            }
            this.commonService.hideSpinner();
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error && error.error) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }


    /**
     * @description get controls
     */
    get permisionFormControls() {
        return this.form.controls;
    }
    /**
     * @description get controls
     */
    get permisionCRMFormControls() {
        return this.crmform.controls;
    }

    /**
     * @description init form with data
     */
    initForm() {
        let data: any = {};
        for (const key in this.roleData) {
            let arr = [];
            for (let i = 0; i < this.roleData[key].names.length; i++) {
                let v = this.roleData[key].names[i].assigned ? true : false;
                arr.push(new FormControl(v));
            }
            data[`${key}`] = this.fb.array(arr);
        }
        this.form = this.fb.group(data);
    }
    /**
    * @description init form with data
    */
    initCrmForm() {
        let data: any = {};
        for (const key in this.crmroleData) {
            let arr = [];
            for (let i = 0; i < this.crmroleData[key].names.length; i++) {
                let v = this.crmroleData[key].names[i].assigned ? true : false;
                arr.push(new FormControl(v));
            }
            data[`${key}`] = this.fb.array(arr);
        }
        this.crmform = this.fb.group(data);

    }


    /**
     * @description on click of update
     * @returns 
     */
    updatePermissions(): void {
        try {
            let permissions = [];
            for (const key in this.form.value) {
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.form.value[key][i]) {
                        permissions.push(this.roleData[key].names[i].name);
                    }
                }
            }

            if (!permissions.length) {
                this.commonService.showError("Minimum one permission is required");
                return
            } else {
                this.submitUpdatePermissions(permissions);
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    /**
   * @description on click of update
   * @returns 
   */
    updateCrmPermissions(): void {
        try {
            let permissions = [];
            let data: any = {};
            for (const key in this.crmform.value) {
                data[key] = {};
                for (let i = 0; i < this.crmform.value[key].length; i++) {
                    // data[key][this.crmroleData[key].names[i].name] = this.crmform.value[key][i] ? 1: 0;
                    data[key][this.crmroleData[key].names[i].name] = this.crmform.value[key][i];
                    permissions.push(this.crmroleData[key].names[i].name);
                }
            }
            if (!permissions.length) {
                this.commonService.showError("Minimum one permission is required");
                return
            } else {
                this.submitCrmUpdatePermissions(data);
            }
        } catch (error: any) {
            this.commonService.showError(error.message);
        }
    }

    /**
     * @description subit updated permission
     * @param permissions 
     */
    async submitUpdatePermissions(permissions: Array<string>) {
        try {
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.UPDATE_ROLE_PERMISSION, { assign_permissions: permissions, role_id: this.roleID }, 'role', 'edit');
            let response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            if(response && response.message){
              let data = response.data;
            //   console.log('data',data);
              
            }
            this.commonService.showSuccess(response.message);
            // this.router.navigate(['/company/roles']);
            this.router.navigate([`/${this.userBaseRoute}/roles`]);
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error && error.error) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    getUserLSDetails(crm_utilties: any): void {
        try {
            let ud = this.authService.getUserDetails();
            if (ud) {
                ud.crm_utilties = crm_utilties;
                const en = this.authService.encrypt(JSON.stringify(ud));
                localStorage.setItem(SETTINGS.USER_DETAILS, en);
            }
        }
        catch (error: any) {
            this.commonService.showError(error.message);
        }
    }
    /**
 * @description subit updated permission
 * @param permissions 
 */
    async submitCrmUpdatePermissions(permissions: any) {
        try {
            this.commonService.showSpinner();
            let res$ = this.apiService.postReq(API_PATH.UPDATE_CRM_PERMISSION, { permissions: permissions, role_id: this.roleID }, 'role', 'edit');
            let response = await lastValueFrom(res$);
            this.commonService.hideSpinner();
            this.commonService.showSuccess(response.message);
            this.crmUtilityArrayresult = Array.isArray(response?.data?.crm_utilties);
            if(this.crmUtilityArrayresult){

            }else{
                    this.getUserLSDetails(response?.data?.crm_utilties);
            }
           
            // this.router.navigate(['/company/roles']);
            this.router.navigate([`/${this.userBaseRoute}/roles`]);
        } catch (error: any) {
            this.commonService.hideSpinner();
            if (error && error.error) {
                this.commonService.showError(error.error.message);
            } else {
                this.commonService.showError(error.message);
            }
        }
    }

    checboxInputChange(roleCategory: string, checkBoxName: string, event: any) {
        for (const key in this.form.value) {
            if (key == roleCategory) {
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (roleCategory == 'Document' && checkBoxName == 'document-list') {
                        this.roleData[roleCategory].names[1].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[2].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[2].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[3].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[3].assigned = 0;
                        }
                    } else if (roleCategory == 'Document' && checkBoxName == 'document-update' && event.target.checked == true) {
                        this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[2].assigned = 1;
                    } else if (roleCategory == 'Document' && checkBoxName == 'document-delete' && event.target.checked == true) {
                        this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[3].assigned = 1;
                    } else if (roleCategory == 'Email-Template' && checkBoxName == 'email-template-list') {
                        this.roleData[roleCategory].names[0].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[1].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[1].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[2].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[2].assigned = 0;
                        }
                    } else if (roleCategory == 'Email-Template' && checkBoxName == 'email-template-view' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = 1;
                    } else if (roleCategory == 'Email-Template' && checkBoxName == 'email-template-view' && event.target.checked == false) {
                        this.roleData[roleCategory].names[1].assigned = 0;
                        this.roleData[roleCategory].names[2].assigned = 0;
                    } else if (roleCategory == 'Email-Template' && checkBoxName == 'email-template-update' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[2].assigned = 1;
                    } else if (roleCategory == 'Lead' && checkBoxName == 'lead-list') {
                        this.roleData[roleCategory].names[1].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[0].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[0].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[3].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[3].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[4].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[4].assigned = 0;
                        }
                    } else if (roleCategory == 'Lead' && checkBoxName == 'lead-delete' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[4].assigned = 1;
                    } else if (roleCategory == 'Lead' && checkBoxName == 'lead-edit' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[3].assigned = 1;
                    } else if (roleCategory == 'Lead' && checkBoxName == 'lead-export' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[5].assigned = 1;
                    } else if (roleCategory == 'Lead-Document' && checkBoxName == 'lead-document-list') {
                        this.roleData[roleCategory].names[0].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[1].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[1].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[3].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[3].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[4].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[4].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[5].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[5].assigned = 0;
                        }
                    } else if (roleCategory == 'Lead-Document' && checkBoxName == 'lead-document-rename' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[3].assigned = 1;
                    } else if (roleCategory == 'Lead-Document' && checkBoxName == 'lead-document-delete' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[4].assigned = 1;
                    } else if (roleCategory == 'Lead-Document' && checkBoxName == 'document-share' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[5].assigned = 1;
                    } else if (roleCategory == 'Syndicate' && checkBoxName == 'syndicate-list') {
                        this.roleData[roleCategory].names[0].assigned = event.target.checked ? 1 : 0;
                        if (this.roleData[roleCategory].names[1].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[1].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[3].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[3].assigned = 0;
                        }
                        if (this.roleData[roleCategory].names[4].assigned == 1 && event.target.checked == false) {
                            this.roleData[roleCategory].names[4].assigned = 0;
                        }
                    } else if (roleCategory == 'Syndicate' && checkBoxName == 'syndicate-update-status' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[3].assigned = 1;
                    } else if (roleCategory == 'Syndicate' && checkBoxName == 'syndicate-delete' && event.target.checked == true) {
                        this.roleData[roleCategory].names[0].assigned = this.roleData[roleCategory].names[1].assigned = this.roleData[roleCategory].names[4].assigned = 1;
                    } else {
                        this.roleData[roleCategory].names[i].assigned = this.form.value[key][i] ? 1 : 0;
                    }
                }
            }
        }
        this.initForm();
    }
    parentCheck(key: string, value: boolean) {
        let formArr = this.form.get(key) as FormArray;
        for (let i = 0; i < formArr.length; i++) {
            formArr.at(i).patchValue(value);
        }
    }
    
    isAllChecked(key: string) {
        let formArr = this.form.get(key) as FormArray;
        // new code here
        let d = formArr.value.every((item: boolean) => item === true)
        if (d) {

            this.bool = true
        } else {
            this.bool = false
        }
        // code end
        return formArr.value.every((item: boolean) => item === true);
    }
    
    checkUncheckAll(roleCategory: string, event: any) {
        for (const key in this.form.value) {
            if (key == roleCategory) {
                for (let i = 0; i < this.form.value[key].length; i++) {
                    this.roleData[key].names[i].assigned = event.target.checked ? 1 : 0
                    if (this.roleData[key].names[i].assigned = event.target.checked) {
                        this.bool = true;
                    } else {
                        this.bool = false
                    }
                }
            }
        }
        this.initForm();
    }

  

    parentCrmCheck(key: string, value: boolean) {
        let formArr = this.crmform.get(key) as FormArray;
        for (let i = 0; i < formArr.length; i++) {
            formArr.at(i).patchValue(value);
        }
    }



    isAllCrmChecked(key: string) {
        let formArr = this.crmform.get(key) as FormArray;
        // new code here
        let d = formArr.value.every((item: boolean) => item === true)
        if (d) {

            this.crmbool = true
        } else {
            this.crmbool = false
        }
        // code end
        return formArr.value.every((item: boolean) => item === true);
    }


   



    markMasterCheckbox(roleCategory: string): any {
        for (const key in this.form.value) {
            if (key == roleCategory && roleCategory == 'Credit-Score') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Data-Merch') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 1) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Document') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 4) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Email-Template') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 3) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Experian-Score') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'FCS') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 3) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 6) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Calendar') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 3) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Document') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 6) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Interview') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Note') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lead-Operations') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 11) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Lender') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Profile') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 2) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Report') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 4) {
                            return true;
                        }
                    }
                }
            }
            if (key == roleCategory && roleCategory == 'Syndicate') {
                var isChecked = 0
                for (let i = 0; i < this.form.value[key].length; i++) {
                    if (this.roleData[key].names[i].assigned == 1) {
                        isChecked++;
                        if (isChecked == 5) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    myfunction() {
        this.route.fragment.subscribe((name: any) => {
            this.activeId = name
        })
    }
    mycrmfunction() {
        this.route.fragment.subscribe((name: any) => {
            this.activeId = name
        })
    }

    // scroll(id: any) {
    //   this.activeId = id
    // const element:any = document.getElementById(id);
    // element.scrollIntoView({ behavior: "smooth" });
    // }

    // activateClass(id:any){
    //   id.active = !id.active;    
    // }



    getDisplayName(value: any) {
        let v1 = value.split('-');
        for (var i = 0; i < v1.length; i++) {
            v1[i] = v1[i].charAt(0).toUpperCase() + v1[i].slice(1);
        }
        const str2 = v1.join(" ");
        return str2

    }

    assignColors() {
        try {
            for (let key in this.crmroleData) {
                for (let j = 0; j < this.crmroleData[key].names.length; j++) {

                    let ele = document.getElementById(`${this.crmroleData[key].names[j].name}${key}`) as HTMLInputElement;
                    if (ele) {
                        if (ele.checked) {
                            ele.style.backgroundColor = this.color;
                            ele.style.borderColor = this.color;
                        } else {
                            ele.style.backgroundColor = '';
                            ele.style.borderColor = '';
                        }
                    }
                }
            }
        } catch (error) {

        }
    }
assignColorManagepermissions(){
    for (let id of this.getAllID) {
        let data = document.getElementById(`${id.name}`) as HTMLInputElement;
        if (data == null) {
            return;
        } else {
            if (data.checked === true) {
                let dataID: any = []
                let data2 = document.getElementById(`${id.name}`) as HTMLInputElement
                dataID.push(data2);
                for (let i = 0; i < dataID.length; i++) {
                    dataID[i].style.backgroundColor = this.color;
                    dataID[i].style.borderColor = this.color;

                }
            }
            else {
                const data2 = document.getElementById(`${id.name}`) as HTMLInputElement
                if (data2 == null) {
                    return;
                } else {
                    if (!data2.checked) {
                        // console.log('as',data2)
                        const dataID: any = []
                        dataID.push(data2);
                        for (let i = 0; i < dataID.length; i++) {
                            dataID[i].style.backgroundColor = '';
                            dataID[i].style.borderColor = '';


                        }
                    }
                }
            }
        }
    }
}
    //new code below for checkbox

    ngAfterViewChecked(): void {
     this.assignColorManagepermissions();
        this.assignColors()

        //     for (let id of this.getAllCrmID) {

        //         let data = document.getElementById(`${id.name}`) as HTMLInputElement;

        //         if(data == null){
        //             return;
        //         }else{
        //         if (data.checked === true) {
        //             let dataID: any = []
        //             let data2 = document.getElementById(`${id.name}`) as HTMLInputElement
        //             dataID.push(data2);
        //             for (let i = 0; i < dataID.length; i++) {
        //                 dataID[i].style.backgroundColor = this.color;
        //                 dataID[i].style.borderColor = this.color;

        //             }
        //         }
        //         else {
        //             const data2 = document.getElementById(`${id.name}`) as HTMLInputElement
        //             if( data2 == null){
        //                 return;
        //             }else{
        //             if (!data2.checked) {
        //                 // console.log('as',data2)
        //                 const dataID: any = []
        //                 dataID.push(data2);
        //                 for (let i = 0; i < dataID.length; i++) {
        //                     dataID[i].style.backgroundColor = '';
        //                     dataID[i].style.borderColor = '';


        //                 }
        //             }
        //         }
        //         }
        //     }
        // }

    }

    test(IdValue: any) {
        this.getAllID = IdValue;
    }

    testcrm(IdValue: any) {

        this.getAllCrmID = IdValue;
    }
    changeFormat(key: any) {
        let v1 = key.split('-');
        for (var i = 0; i < v1.length; i++) {
            v1[i] = v1[i].charAt(0).toUpperCase() + v1[i].slice(1);
        }
        const str2 = v1.join("-");
        return str2
    }
    openfullView() {
        // this.getPaginationList()
        this.tabView = false;
        this.getRolePermissions();
        // this.getUserDetails();
        // this.assignColorManagepermissions();

    }
    sendSpec() {
        this.tabView = true;
        this.getCrmRolePermissions();
        // this.getUserDetails();
        // this.assignColors()
        // this.userListPage = 1;
        // this.page = 1;
        // this.getLeadDocuments();
        // this.getspecParticipantList();
    }
    // formCheck() { 
    //     const tds = document.getElementsByClassName('form-check-input') as HTMLCollectionOf<HTMLElement>;
    //     console.log(tds);
        
    //     for (let index = 0; index < tds.length; index++) {
    //         tds[index].style.setProperty('--custom', `${this.color}`);
    
    //     }
    // }

}