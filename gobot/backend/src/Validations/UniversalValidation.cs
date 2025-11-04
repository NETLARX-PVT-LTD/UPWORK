// ---------------------------------------------------------------------
// <copyright file="BotValidation.cs" company="Netlarx">
// Copyright (c) Netlarx Softwares Pvt Ltd. All rights reserved.
// ---------------------------------------------------------------------


namespace Netlarx.Products.Gobot.Validations
{
    using System.Reflection;
    using Netlarx.Products.Gobot.Errors;

    public static class UniversalValidation
    {
        public static bool Validate(object block, Errors errors)
        {
            if (block == null)
            {
                errors.Fill(FailureCode.ValidationError, "Request object cannot be null.");
                return false;
            }

            var type = block.GetType();
            var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var prop in properties)
            {
                var value = prop.GetValue(block);
                if (prop.GetIndexParameters().Length > 0)
                {
                    continue; // Skip properties with index parameters
                }

                if (prop.PropertyType == typeof(string))
                {
                    if (string.IsNullOrWhiteSpace(value as string))
                    {
                        errors.Fill(FailureCode.ValidationError, $"{prop.Name} is required.");
                        return false;
                    }
                }

                if (prop.PropertyType == typeof(int))
                {
                    int intValue = (int)value;
                    if ((prop.Name.ToLower().Contains("maxtoken") && (intValue < 100 || intValue > 2000)) ||
                        (prop.Name.ToLower().Contains("maxpages") && intValue < 0) ||
                        (prop.Name.ToLower().Contains("maxdepth") && intValue < 0))
                    {
                        errors.Fill(FailureCode.ValidationError, $"{prop.Name} has invalid value.");
                        return false;
                    }
                }

                if (prop.PropertyType == typeof(double))
                {
                    double dValue = (double)value;
                    if ((prop.Name.ToLower().Contains("temperature") && (dValue < 0 || dValue > 0.7)) ||
                        (prop.Name.ToLower().Contains("topp") && (dValue < 0 || dValue > 0.4)))
                    {
                        errors.Fill(FailureCode.ValidationError, $"{prop.Name} has invalid value.");
                        return false;
                    }
                }

                if (!prop.PropertyType.IsPrimitive && prop.PropertyType != typeof(string))
                {
                    if (value != null && !Validate(value, errors))
                    {
                        return false;
                    }
                }
            }

            return true;
        }

    }
}
