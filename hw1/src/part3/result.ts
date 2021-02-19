/* Question 3 */

export type Result<T> = Ok<T> | Failure;

interface Failure{
    tag:'Failure';
    message: string;}

interface Ok<T>{
    tag:'Ok';
    value: T;
}


export const makeOk = <T>(x:T):Ok<T> => {return {tag:'Ok', value:x}};
export const makeFailure =(x:string):Failure => {return {  tag:'Failure', message:x}};

export const isOk = <T>(result: Result<T>): boolean => { if(result.tag==='Ok') return true; return false};
export const isFailure =<T>(result: Result<T>): boolean => { if(result.tag==='Failure') return true; return false};

/* Question 4 */
export const bind = <T, U>(result: Result<T>, f: (x: T) => Result<U>): Result<U> => {
    switch(result.tag) {
        case "Ok" : const newResult = f(result.value); return newResult;
        case "Failure" : return result;
     }
 }

 
/* Question 5 */
interface User {
    name: string;
    email: string;
    handle: string;
}

const validateName = (user: User): Result<User> =>
    user.name.length === 0 ? makeFailure("Name cannot be empty") :
    user.name === "Bananas" ? makeFailure("Bananas is not a name") :
    makeOk(user);

const validateEmail = (user: User): Result<User> =>
    user.email.length === 0 ? makeFailure("Email cannot be empty") :
    user.email.endsWith("bananas.com") ? makeFailure("Domain bananas.com is not allowed") :
    makeOk(user);

const validateHandle = (user: User): Result<User> =>
    user.handle.length === 0 ? makeFailure("Handle cannot be empty") :
    user.handle.startsWith("@") ? makeFailure("This isn't Twitter") :
    makeOk(user);

export const naiveValidateUser = (user: User): Result<User> =>{
    let user2= validateName(user);
    let user3= validateEmail(user);
    let user4= validateHandle(user);

    if(user2.tag==='Failure') return user2 ;
    else if(user3.tag==='Failure') return user3;
      else  if(user4.tag==='Failure') return user4;
          else return user2;

}

export const monadicValidateUser = (user: User): Result<User> => {
    return bind(bind(validateName(user),validateEmail),validateHandle); 
}

