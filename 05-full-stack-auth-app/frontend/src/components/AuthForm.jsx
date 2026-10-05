import { useForm } from "react-hook-form";

export default function AuthForm({ type = "login", onSubmit }) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="form">
            <h2 className="h2">{type === 'login' ? 'Login' : 'Signup'}</h2>

            <div className="mb-3">
                <label htmlFor="usernameInput" className="form-label">Username</label>
                <input type="text" id="usernameInput" className="form-control" placeholder="Username" 
                    {...register("username", { required: "Username is required"})}
                />
            </div>

            {
                type === "signup" && (
                    <div className="mb-3">
                        <label htmlFor="userEmail" className="form-label">Email</label>
                        <input type="email" id="userEmail" className="form-control"
                            placeholder="email"
                            {...register("email", { required: "User Email is required" })}
                        />
                    </div>
                )
            }

            <div className="mb-3">
                <label htmlFor="userPassword" className="form-label">Password</label>
                <input type="password" id="userPassword" className="form-control" 
                    {...register("password", { required: "Password is needed" })}
                />
            </div>

            { type === "signup" && (
                <>
                    <div className="mb-3">
                        <label htmlFor="userFirstName" className="form-label">First Name</label>
                        <input type="text" id="userFirstName" className="form-control" 
                            placeholder="First Name"
                            {...register("firstName", { required: "First Name is required" })}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="userFirstName" className="form-label">First Name</label>
                        <input type="text" id="userFirstName" className="form-control" 
                            placeholder="First Name"
                            {...register("firstName", { required: "First Name is required" })}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="userLastName" className="form-label">Last Name</label>
                        <input type="text" id="userLastName" className="form-control" 
                            placeholder="Last Name"
                            {...register("firstName", { required: "Last Name is required" })}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="userAge" className="form-label">Age</label>
                        <input type="text" id="userAge" className="form-control" 
                            placeholder="18..."
                            {...register("firstName", { required: "Age is required" })}
                        />
                    </div>
                </>
            )}

            {errors.password && (
                <div className="invalid-feedback">{ errors.password.message }</div>
            )}

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : type === 'login' ? "Login" : "Signup"}
            </button>
        </form>
    );
}