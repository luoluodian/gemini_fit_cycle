import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * 物理平衡校验器 (Physics Balance Constraint)
 * 业务背景：从常识层面杜绝无效数据。例如 100g 的食物中，
 * 蛋白质、脂肪、碳水的总重量理论上不可能超过 100g（实际上通常小于 100g，因为含有水分）。
 */
@ValidatorConstraint({ name: 'isPhysicsBalanced', async: false })
export class IsPhysicsBalancedConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const protein = Number(object.protein || 0);
    const fat = Number(object.fat || 0);
    const carbs = Number(object.carbs || 0);
    const baseCount = Number(object.baseCount || 100);

    // 物理守恒公式：三大营养素总和 <= 基准重量
    return protein + fat + carbs <= baseCount;
  }

  defaultMessage(args: ValidationArguments) {
    return '营养成分总和(蛋白质+脂肪+碳水)不能超过基准重量(baseCount)';
  }
}

export function IsPhysicsBalanced(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhysicsBalancedConstraint,
    });
  };
}
