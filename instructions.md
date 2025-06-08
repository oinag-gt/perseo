# Objective
I want to build an application that manage various aspects (like people management, courses, enrollments, instructors management, bill profile for students, payment profiles for professors) related to an educational and cultural center. 

# Modules
I want to start with these administrative modules: 

## People Module
This module should be in charge of manage abstract and generic people registration, with basic person fields. Later in other modules we will assign them as students, instructors, associate member, etc. For now, administrative users should be in charge or registrer those people. 

- A person can belong to various groups.
- A group represents various people that belongs together. We will create groups like: instructors, members, volunteers, etc. 
- A group can have a parent group
- A group can have a person in charge (leader)
- We should register the movements of people between groups: in or out, with date and notes

## Academic Control's Module
This module depends on People's Module
Here we should manage courses, course instances, instructors (Person), attendees (Person)


### Rules
- A course should be created/modified that specifies the details of a course (this is like a template for a course instance)
- We should have the ability to add people interested in the course, even if there is no Course instance at the moment
- A course instance is a course that will be offered with specific context of time, instructor, offers (ussually one) etc. This should be created in order to enroll attendees (students)
- A student (person) can be enrolled in a course instance. For now, an administrative user would do this. 
- We should be able to add people interested in a course instance. This is like enrollment but the difference are that they didn't pay yet. 
- A student enrolled in a course could have an approved status (yes or not) and calification. 

### Data inspiration
Course, Attendee and Instructor: https://schema.org/Course
Course Instance: https://schema.org/CourseInstance
Course Offers: https://schema.org/Offer

## Accounts receivable
This module should register invoices. This module depens on People's module, and Academic Control's Module

### Rules
- Charges are created based on students enrollment in courses. 
- Also there are charges related to invoice profiles based on their enrollment in groups (people's module). For instance, people in "members" gruoup should have monthly charges. 
- An invoice is a collection of charges to be paid.
- Charges could be recurrent, or one-time. 


## Accounts payable
Module to register obbligations to pay. In this context we will resgiter the payments we should do to the instructors. This module depens on People's module and academic contro's module. 

### Rules
- We should create the concept of profile, which tells how to manage the payment obligation. 
- Default payment profile: Normally a instructor is paid by a 40% percentage of the received money of all students. However this could change. 
- We could create specific payment profile that applies for a course only. 
- We could create specific payment profile that applies for a course instance only. 
- We could create specific payment profile for a instructor in general.
- We could create a payment profile that represent a static amount, instead of a percentage. 
- THis is the precedence order for profiles (from high to low/defaults): course instance, course, instructor, default.
- A charge (or find a better name) should be register for each course (or other matters) we owe to a person
- A payable invoice should be generated at the end of the month, based on the charges. 
- A payable invoice should be payed. For now, we could simply do it.


# General specifications 
## Multi-tenant
- A tenant is like a different instance of the application, but they all are managed in the same application instance. This is for saving costs.
- We will offer this product to different companies, so each one should be a tenant
- A special user role should be able to manage (create, update, delete) tenants/companies.

## Multi-account
- A tenant could have multiple accounts
- All data in People's module, Accounts Payable, Accounts receivable, are shared accross accounts. 
- A user can be assigned to modules
- A user can be assigned to specific accounts on such modules

## Multi-language
We want the user-interface to be available in different languages. For now, we should manage Spanish (first priority) and English.

## User Magagement
Suggest a good approach for this based on all avobe

