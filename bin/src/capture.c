// LINUX CAPTURE SRC CODE
// compile using `gcc ./bin/src/capture.c -o ./bin/linux/capture `pkg-config --cflags --libs x11 cairo` 
// after compiling make it an exec  chmod +x ./bin/linux/capture
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <cairo/cairo.h>
#include <cairo/cairo-xlib.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>


int main(int argc, char** argv) {
    if (argc != 6) {
        fprintf(stderr, "Usage: %s x y width height output.png\n", argv[0]);
        return 1;
    }

    int x = atoi(argv[1]);
    int y = atoi(argv[2]);
    int w = atoi(argv[3]);
    int h = atoi(argv[4]);
    const char* output = argv[5];

    Display* dpy = XOpenDisplay(NULL);
    if (!dpy) {
        fprintf(stderr, "Cannot open display\n");
        return 1;
    }

    Window root = DefaultRootWindow(dpy);
    XImage* img = XGetImage(dpy, root, x, y, w, h, AllPlanes, ZPixmap);

    if (!img) {
        fprintf(stderr, "Failed to get image\n");
        XCloseDisplay(dpy);
        return 1;
    }

    cairo_surface_t* surface = cairo_image_surface_create_for_data(
        (unsigned char*)img->data,
        CAIRO_FORMAT_RGB24,
        img->width,
        img->height,
        img->bytes_per_line
    );

    cairo_surface_write_to_png(surface, output);

    cairo_surface_destroy(surface);
    XDestroyImage(img);
    XCloseDisplay(dpy);

    return 0;
}
