# Spacetime Interval Arithmetic for Animated Implicit Scenes


To run, simply open index.html in the latest version of Chrome.

Note that min_dx and min_dy control the size of the smallest regions.

**Controls:**
* Numbers 1-3 change the visualization:
  * 1: Ground truth per-frame evaluation
  * 2: Eval1 + modifications/optimizations
  * 3: Eval1
* Space to pause/unpause
* R to refresh page
* Right click a region to print it to the console
  
**Graph modifiers:**

Press F12 to open the developer console.

Inside, the following variables can be changes to modify the performance plotter:

* x_scale, to stretch the data horizontally
* canvas2.x_dim to change the x-axis numbering density
* canvas2.y_dim to change the y-axis numbering density
