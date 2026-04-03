# Using Dagger to run AI in CI pipelines

In my Curiousity Report, I investigated using a framework called Dagger that utilizes functional code instead of yml files to locally run pipeline deployments. This allows the ability
to run many logical checks before a system is ever deployed. It also allows the seamless integration of AI api calls directly in my pipeline.

## What I learned

There are many different ways to run a CI pipeline from local to deployment. Personally, .yaml files became very hard to maintain and keep track of, and lacked a lot of functionality that real code
allowed. Dagger is a framework that can be installed on any project and lets you write a python file that manages your entire pipeline. Dagger is actually created by the creators of Docker
and share the same mission of making code runnable anywhere without limitations of OS incompatabilities. Running pipeline operations in a container means it will run the same on any environment. If someone else wants to deploy my code, it runs the exact same on my machine as others. Docker is amazing!!!

## How it works

After starting your project and installing Docker, running `dagger init --sdk=python"` starts the .dagger directory and also spins up a Dagger Engine inside a container on your machine. 
Then, using the main.py file in the .dagger file, the dagger SDK runs your main.py file inside its engine, organizing tasks by priority and dependencies. After running through the engine,
it then sends out any commands for deployment.

Here is a diagram that I drew up that helped me

<img width="1216" height="913" alt="image" src="https://github.com/user-attachments/assets/d9427835-6eb6-423a-ab41-c1cf16504c34" />


## SUPER cool advantages

This eliminates all need for any yml files in your pipeline. It gives the power to use loops, if conditions, ect. inside the pipeline. You can also use AI agents to review your code
before it gets deployed. This makes deployement much faster and eliminates the cloud environment that GitHub Actions uses. Its much faster and has much more capabilities.

Also Dagger uses extensive cacheing to make repeated deployments so much faster. Now, running tests and quick deployments can be part of your routine coding session without having to 
wait around for GitHub to finish.

## Cool example

I created a sample project and created a dagger pipeline that makes an API call that reviews any code issues before ever deploying.

Using Dagger, it builds, checks and deploys my entire projects before deploying it on my linux server. In the image, I was able to use AI to check the code before deploying.

It found some error and stopped the deployment. Pretty cool! I'd like to see you try and do that in a .yaml file

<img width="890" height="852" alt="dagger-curiosity-report" src="https://github.com/user-attachments/assets/02cf833c-95c1-4971-a204-adeb2bd22072" />

## Conclusion

I am a big fan of python, and even though using dagger just to write in python is a little much, it really is cool to have the entire pipeline run locally. Some may argue that depending too much on your own hardware can cause some issues, it is cool to see that it is possible and have so much control. Experimenting with dagger has sparked the importance of multiple logic gates and checks inside the actual pipeline and how easy it can make larger projects. I think software like this will help scale my personal projects to be bigger and easier to maintain. Overall, Dagger is an awesome beginner option for pipeline control, especially for the python fanatics.


