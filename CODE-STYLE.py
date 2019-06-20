"""Short description of file/module.

This module lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis semper velit ante, et
aliquet leo aliquet nonnec sem magna. Phasellus hendrerit neque dui, at lobortis ipsum fermentum
non. Aenean egestas velit felis, vel interdum neque volutpat at. Nulla facilisi. Pellentesque
porttitor, erat id congue sollicitudin, arcu nulla porttitor eros, vel porta velit purus a magna.
Aptent taciti sociosqu ad litora torquent per conubia stra, per inceptos himenaeos.
"""


# ==================================================================================================
# Section name for block of code.
# -------------------------------
# Add optional notes here. A block should be used to group a set of related functions or variables.
# The relative ordering of blocks are important -- make sure that the entire code file is logically
# organized. Imagine being a new developer to this codebase who is trying to understand the code.

# --------------------------------------------------------------------------------------------------
# Subsection name.


def func1(arg1: str, arg2: Optional[int] = 123) -> bool:
    """Short description of function.

    Longer details about function. Class aptent taciti sociosqu ad litora torquent per conubia stra,
    per inceptos himenaeos. Nam pretium ipsum ex, ac aliquet lectus ultrices a.
    @param arg1
        Description of argument 1.
    @param arg2 (optional)
        Description of optional argument 2. (default: 123)
    @return
        Description of return value 1.
    """
    # This is how to write longer style comments within method bodies.
    # Docstrings are used for interface comments and hash symbols are used for
    # for implementation comments.
    return True  # Capitalize first word.


def _func2():
    """Simple one-liner private function."""
    pass


class ClassName(object):
    """Short description of class.

    Longer description of class. Class aptent taciti sociosqu ad litora torquent per conubia stra,
    per inceptos himenaeos. Nam pretium ipsum ex, ac aliquet lectus ultrices a.
    """

    def __init__(self, arg1: int):
        """Constructor method, required.
            @param arg1
                Description of argument 1.
        """
        super(ClassName, self).__init__()

        # Description of variable.
        self.arg1 = arg1
        
        pass
        
"""In docstrings, can include richer reStructuredText (reST) directives.

To write inline code, simply us special brackets, like ``hello_world()``.

To write display code::

    int i = 1
    if i > 0:
        print('Hello world.')

To write display code with output::

    >>> int i = 1
    >>> if i > 0:
    >>>     print('Hello world.')
    'Hello world.'

To cross-reference, have many different options:

    - attributes as :attr:`name`
    - classes as :class:`mod.ExampleClass` (displays as ``mod.ExampleClass``) or as
      :class:`~mod.ExampleClass` (displays as ``ExampleClass``)
    - functions as :func:`mod.func1` (not associated with object)
    - methods as :meth:`mod.ExampleClass.func1` (associated with object)

To write math, can include inline :math:`\mathbf{h} = \sigma (\mathbf{W_{hx} x} + \mathbf{b_{hx}})`,
or display:

.. math::
    \mathbf{h} = \sigma (\mathbf{W_{hx} x} + \mathbf{b_{hx}})

To add special comment boxes:

.. seealso:: Link to other module :class:`mod.ExampleClass`.
.. warning:: Do not run code, lest your computer will catch on fire.
.. note:: This is a note. Let what it says be noted.
"""
