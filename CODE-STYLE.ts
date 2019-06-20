/**
 * Short description of file/module.
 *
 * This module lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis semper velit ante, et
 * aliquet leo aliquet nonnec sem magna. Phasellus hendrerit neque dui, at lobortis ipsum fermentum
 * non. Aenean egestas velit felis, vel interdum neque volutpat at. Nulla facilisi. Pellentesque
 * porttitor, erat id congue sollicitudin, arcu nulla porttitor eros, vel porta velit purus a magna.
 * Aptent taciti sociosqu ad litora torquent per conubia stra, per inceptos himenaeos.
 */


// =================================================================================================
// Section name for block of code.
// -------------------------------
// Add optional notes here. A block should be used to group a set of related functions or variables.
// The relative ordering of blocks are important -- make sure that the entire code file is logically
// organized. Imagine being a new developer to this codebase who is trying to understand the code.

// -------------------------------------------------------------------------------------------------
// Subsection name.

/* Stars are used for interface comments. These comments convey conceptual knowledge necessary for
 * a user of the API to know about. */

// Slashes are used for implementation comments.

/* Short description of constant. */
const kConstant1 = 0;

/* Short description of variable. */
let variable1 = 0;

/* Short description of variable/constant with multiple sentences. Use compressed interface-style
 * comments for variables/constants. */
let variable2 = "hello";

/* Variables/constants that are grouped should be PREFIXED with the group name, not suffixed. For
 * example, rather than "apple_color"/"banana_color"/"carrot_color" instead use
 * "color_apple"/"color_banana"/"color_carrot". This homogeneity makes it more apparent that the
 * names are grouped. */
let group1_variant1 = "a";
let group1_variant2 = "b";
let group1_variant3 = "c";

/**
 * Short description of function.
 *
 * Longer details about function. Class aptent taciti sociosqu ad litora torquent per conubia stra,
 * per inceptos himenaeos. Nam pretium ipsum ex, ac aliquet lectus ultrices a.
 * @param arg1
 *     Description of argument 1.
 * @param arg2 (optional)
 *     Description of optional argument 2. (default: 123)
 * @return
 *     Description of return 1.
 */
function func1(arg1: string, arg2: number = 123): number {
    // Implementation comments complement the code by explaining what is going on at either a
    // higher or lower level as the code; comments at the same level are redundant. Higher-level
    // implementation comments explain the aim of a piece of code, particularly if it contains
    // complex logic. Lower-level implementation comments provide detail that is not reflected in
    // the code, e.g. the units of a variable or definitions of terms.
    return 0;
 }

 /**
  * @return
  *     Short description of trivial function.
  */
function func2(): boolean {
    // TODO: This needs more work.
    return false;
}