import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Gender } from 'src/app/models/ui-models/gender.model';
import { Student } from 'src/app/models/ui-models/student.model';
import { GenderService } from 'src/app/services/gender.service';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css']
})
export class ViewStudentComponent implements OnInit {

  studentId: string | null | undefined;

  student: Student = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobile: 0,
    genderId: '',
    profileImageUrl: '',
    gender: {
      id:'',
      description:''
    },
    address:{
      id:'',
      physicalAddress:'',
      postalAddress:''
    }

  }

  genderList: Gender[] = [];

  isNewStudent = false;
  header = '';
  displayProfileImageUrl = '';

  constructor(private readonly studentService: StudentService,
    private route: ActivatedRoute, private readonly genderService: GenderService,
    private snackBar:MatSnackBar , private router : Router) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(
      (params) => {
        this.studentId = params.get('id');

        if(this.studentId){

          //If the route contains the 'Add' --> New Student Functionality
          if(this.studentId.toLowerCase() === 'Add'.toLowerCase()){
            this.isNewStudent = true;
            this.header = 'Add New Student';
            this.setImage();

          }else{
            //Else --> Existing Student Functionality
            this.isNewStudent = false;
            this.header = 'Edit Student';

              this.studentService.getStudent(this.studentId)
            .subscribe(
              (successResponse) => {
                // console.log(successResponse);
                this.student = successResponse;
                this.setImage();
              },
              (errorResponse) => {
                console.log(errorResponse);
                this.setImage();

              }
            );

          }

          this.genderService.getGenderList()
            .subscribe(
              (successResponse) => {
                // console.log(successResponse);
                this.genderList = successResponse;
              }
            );



        }

      });


  }

  onUpdate(): void{
    //console.log(this.student);
    //Call student service to update student
    this.studentService.updateStudent(this.student.id,this.student)
    .subscribe(
      (successResponse) => {
        // console.log(successResponse);
        //Show a Notification to user
        this.snackBar.open('Student Updated Successfully',undefined,{
          duration: 2000
        });

      },
      (errorResponse) => {
        console.log(errorResponse);
      }
    );
  }


  onDelete(): void {
    //studentService to Delete the Student
    this.studentService.deleteStudent(this.student.id)
    .subscribe(
      (successResponse) => {
        // console.log(successResponse);
        this.snackBar.open('Student Deleted Successfully',undefined,{
          duration:2000
        });

        setTimeout(() => {
          this.router.navigateByUrl('students');
        }, 2000);

      },
      (errorResponse) => {
        console.log(errorResponse);
      },
    );
  }

  onAdd(): void{
    this.studentService.addStudent(this.student).subscribe(
      (successResponse) => {
        // console.log(successResponse);
        this.snackBar.open('Student Added Successfully',undefined,{
          duration:2000
        });

        setTimeout(() => {
          // this.router.navigateByUrl('students');
          this.router.navigateByUrl(`students/${successResponse.id}`);
        }, 2000);
      },
      (errorResponse) => {
        console.log(errorResponse);
      },
    );
  }

  uploadImage(event : any) : void{
    if(this.studentId){
      const file : File = event.target.files[0];
      this.studentService.uploadImage(this.student.id,file).subscribe(
        (successResponse) => {
          console.log(successResponse);

          this.student.profileImageUrl = successResponse;
          this.setImage();

          this.snackBar.open('Profile Image updated Successfully',undefined,{
            duration:2000
          });

        },
        (errorResponse) => {
          console.log(errorResponse);

        }
      );
    }
  }

  private setImage(): void{
    if(this.student.profileImageUrl){
      //Fetch the image by url
      this.displayProfileImageUrl = this.studentService.getImagePath(this.student.profileImageUrl);

    }else{
      //display default Image
      this.displayProfileImageUrl = '/assets/userImage.jpeg';
    }
  }

}
